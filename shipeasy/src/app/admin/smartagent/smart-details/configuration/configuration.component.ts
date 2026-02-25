import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonService } from 'src/app/services/common/common.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

interface TierUserDetail {
  userId: string;
  userName: string;
}

interface TierConfig {
  tierName: string;
  selectedUsers: string[];
  valueBasedApprovals: boolean;
  allApprovalRequired: boolean;
  position: number;
  valueBasedConfig?: ValueBasedConfig;
}

interface ValueBasedConfig {
  daTotal: {
    minCommercial: number | null;
    maxCommercial: number | null;
    sequenceCommercial: number | null;
    minNonCommercial: number | null;
    maxNonCommercial: number | null;
    sequenceNonCommercial: number | null;
  };
  departmentTotal: {
    minCommercial: number | null;
    maxCommercial: number | null;
    sequenceCommercial: number | null;
    minNonCommercial: number | null;
    maxNonCommercial: number | null;
    sequenceNonCommercial: number | null;
  };
}

interface DepartmentConfig {
  department: string;
  departmentId?: string;
  deptName?: string;
  maskingName: string;
  tierCount: number;
  tiers: TierConfig[];
  position: number;
}

interface User {
  _id: string;
  userId: string;
  name: string;
  userName: string;
  shortName: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  department: Array<{
    item_id: string;
    item_text: string;
    departmentId: string;
    departmentName?: string;
    name?: string;
  }>;
}

interface Department {
  _id?: string;
  id?: string;
  item_text?: string;
  departmentName?: string;
  name?: string;
  department?: string;
  deptName?: string;
  departmentId?: string;
  status?: boolean;
  tenantId?: string;
  orgId?: string;
  parentId?: string;
  isDeptType?: string;
  deptManager?: string;
  deptEmail?: string;
  referenceId?: string;
  createdOn?: string;
  updatedOn?: string;
  createdBy?: string;
  createdByUID?: string;
  updatedBy?: string;
  updatedByUID?: string;
  __v?: number;
  assignedChatPerson?: {
    userId?: string;
    userName?: string;
  };
  module?: string;
  deptManagerId?: string;
}

interface InvoiceApprovalConfig {
  invoiceapprovalId?: string;
  orgId?: string;
  createdOn?: string;
  updatedOn?: string;
  createdBy?: string;
  createdByUID?: string;
  updatedBy?: string;
  updatedByUID?: string;
  departmentSettings: any[];
}

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {
  
  departmentConfigs: DepartmentConfig[] = [];
  availableDepartments: any[] = [];
  departmentList: Department[] = [];
  userList: User[] = [];
  allUsers: User[] = [];
  showValueBasedModal: boolean = false;
  selectedTierIndex: number = -1;
  selectedConfigIndex: number = -1;
  isLoading: boolean = false;
  loadingMessage: string = '';
  
  existingConfigId: string | null = null;
  isEditMode: boolean = false;
  
  departmentIdMap: Map<string, string> = new Map();

  constructor(
    private commonService: CommonService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.loadingMessage = 'Loading configuration...';
    this.loadExistingConfiguration();
  }

  loadExistingConfiguration() {
    this.commonService.getSTList("invoiceapproval", this.commonService.filterList())?.subscribe(
      (res: any) => {
        console.log("Invoice Approval Config Response:", res);
        
        if (res?.documents && res.documents.length > 0) {
          const existingConfig = res.documents[0];
          this.existingConfigId = existingConfig.invoiceapprovalId || existingConfig.departmentId;
          this.isEditMode = true;
          
          this.loadingMessage = 'Loading departments...';
          this.getDepartments(existingConfig);
        } else {
          this.isEditMode = false;
          this.loadingMessage = 'Loading departments...';
          this.getDepartments();
        }
      },
      (error) => {
        console.error("Error fetching invoice approval config:", error);
        this.isEditMode = false;
        this.loadingMessage = 'Loading departments...';
        this.getDepartments();
      }
    );
  }

  getDepartments(existingConfig?: any) {
    let agentPayload = this.commonService.filterList();
    this.commonService.getSTList("department", agentPayload)?.subscribe(
      (res: any) => {
        console.log("Department API Response:", res);
        this.departmentList = res?.documents || [];
        console.log("Department List:", this.departmentList);
        
        this.loadingMessage = 'Loading users...';
        this.getUserAgent(existingConfig);
      }, 
      (error) => {
        console.error("Error fetching departments:", error);
        this.loadingMessage = 'Loading users...';
        this.getUserAgent(existingConfig);
      }
    );
  }

  getUserAgent(existingConfig?: any) {
    let agentPayload = this.commonService.filterList();
    this.commonService.getSTList("user", agentPayload)?.subscribe(
      (res: any) => {
        console.log("User API Response:", res);
        this.userList = res?.documents || [];
        this.allUsers = this.userList;
        console.log("User List:", this.userList);
        
        this.loadingMessage = 'Processing data...';
        this.processData(existingConfig);
      }, 
      (error) => {
        console.error("Error fetching users:", error);
        this.processData(existingConfig);
      }
    );
  }

  processData(existingConfig?: any) {
    try {
      console.log("Processing data - Department List:", this.departmentList);
      
      this.departmentIdMap.clear();
      
      if (this.departmentList && this.departmentList.length > 0) {
        this.availableDepartments = this.departmentList
          .filter(dept => dept.status !== false)
          .map(dept => {
            const departmentName = dept.deptName || 
                                 dept.item_text || 
                                 dept.departmentName || 
                                 dept.name || 
                                 dept.department;
            
            const departmentUUID = dept.departmentId || dept.departmentId;
            
            console.log(`Processing department: ${departmentName}, UUID: ${departmentUUID}`);
            
            if (departmentName && departmentUUID) {
              this.departmentIdMap.set(departmentName, departmentUUID);
              console.log(`Mapped: ${departmentName} -> ${departmentUUID}`);
            }
            
            return {
              id: departmentUUID,
              _id: departmentUUID,
              name: departmentName,
              deptName: departmentName,
              status: dept.status,
              departmentId: departmentUUID,
              originalData: dept,
              ...dept
            };
          })
          .filter(dept => {
            const hasValidName = dept.name && dept.name.trim() !== '';
            const hasValidId = dept.id || dept.departmentId || dept.departmentId;
            console.log(`Department ${dept.name} - Valid name: ${hasValidName}, Valid UUID: ${hasValidId}`);
            return hasValidName && hasValidId;
          });
      } else {
        console.log("No departments from API, trying to extract from users...");
        this.extractDepartmentsFromUsers();
      }
      
      console.log("Department ID Map:", Array.from(this.departmentIdMap.entries()));
      console.log("Available Departments after processing:", this.availableDepartments);
      
      if (this.availableDepartments && this.availableDepartments.length > 0) {
        if (existingConfig && existingConfig.departmentSettings) {
          this.loadExistingDepartmentConfigs(existingConfig.departmentSettings);
        } else {
          this.createDepartmentConfigs();
        }
      } else {
        console.warn("No valid departments found!");
      }
      
      this.isLoading = false;
      this.loadingMessage = '';
    } catch (error) {
      console.error("Error processing data:", error);
      this.isLoading = false;
      this.loadingMessage = '';
    }
  }

  loadExistingDepartmentConfigs(departmentSettings: any[]) {
    this.departmentConfigs = departmentSettings.map((setting, index) => {
      const deptName = setting.deptName || setting.department;
      
      let departmentUUID = setting.departmentId;
      
      if (!departmentUUID || !departmentUUID.includes('-')) {
        departmentUUID = this.departmentIdMap.get(deptName);
        console.log(`Retrieved UUID from map for ${deptName}: ${departmentUUID}`);
      }
      
      console.log(`Loading existing config for ${deptName}, UUID: ${departmentUUID}`);
      
      return {
        department: deptName,
        deptName: deptName,
        departmentId: departmentUUID,
        maskingName: setting.maskingName,
        tierCount: setting.tierCount || setting.tiers.length,
        position: setting.position || (index + 1),
        tiers: setting.tiers.map((tier: any, tierIndex: number) => {
          const userIds = tier.selectedUsers.map((u: any) => 
            typeof u === 'string' ? u : u.userId
          );
          
          return {
            tierName: tier.tierName,
            selectedUsers: userIds,
            valueBasedApprovals: tier.valueBasedApprovals || false,
            allApprovalRequired: tier.allApprovalRequired || false,
            position: tier.position || (tierIndex + 1),
            valueBasedConfig: tier.valueBasedConfig
          };
        })
      };
    });
    
    console.log("Loaded existing department configs:", this.departmentConfigs);
  }

  extractDepartmentsFromUsers() {
    const departmentMap = new Map();

    this.userList.forEach(user => {
      if (user.department && user.department.length > 0) {
        user.department.forEach((dept: any) => {
          const deptId = dept.departmentId || dept.item_id;
          const deptName = dept.item_text || dept.departmentName || dept.name;
          
          if (deptId && deptName && !departmentMap.has(deptId)) {
            this.departmentIdMap.set(deptName, deptId);
            
            departmentMap.set(deptId, {
              id: deptId,
              _id: deptId,
              departmentId: deptId,
              name: deptName,
              deptName: deptName,
              ...dept
            });
          }
        });
      }
    });

    this.availableDepartments = Array.from(departmentMap.values());
    console.log("Departments extracted from users:", this.availableDepartments);
    console.log("Department ID Map after extraction:", Array.from(this.departmentIdMap.entries()));
  }

  createDepartmentConfigs() {
    this.departmentConfigs = this.availableDepartments.map((dept, index) => {
      const maskingName = dept.name ? dept.name.substring(0, 3).toUpperCase() : 'DEP';
      
      const departmentUUID = dept.id || dept.departmentId || dept.departmentId;
      const deptName = dept.name || dept.deptName;
      
      console.log(`Creating config for department: ${deptName}, UUID: ${departmentUUID}`);
      
      return {
        department: deptName,
        deptName: deptName,
        departmentId: departmentUUID,
        maskingName: maskingName,
        tierCount: 1,
        position: index + 1,
        tiers: [
          {
            tierName: '',
            selectedUsers: [],
            valueBasedApprovals: false,
            allApprovalRequired: false,
            position: 1
          }
        ]
      };
    });
    
    console.log("Department Configs Created with UUIDs:", this.departmentConfigs);
  }

  getDepartmentIdByName(departmentName: string): string | undefined {
    const uuidFromMap = this.departmentIdMap.get(departmentName);
    if (uuidFromMap) {
      console.log(`Got UUID from map for ${departmentName}: ${uuidFromMap}`);
      return uuidFromMap;
    }
    
    const dept = this.availableDepartments.find(d => d.name === departmentName || d.deptName === departmentName);
    const uuid = dept?.id || dept?.departmentId || dept?.departmentId;
    
    console.log(`Got UUID from availableDepartments for ${departmentName}: ${uuid}`);
    return uuid;
  }

  getUsersByDepartment(departmentName: string): User[] {
    if (!departmentName) return [];
    
    return this.allUsers.filter(user => {
      if (!user.department || user.department.length === 0) {
        return false;
      }
      
      return user.department.some(dept => {
        const deptName = dept.item_text || dept.departmentName || dept.name;
        return deptName === departmentName;
      });
    });
  }

  getUserCountByDepartment(departmentName: string): number {
    return this.getUsersByDepartment(departmentName).length;
  }

  onRowDrop(event: CdkDragDrop<DepartmentConfig[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        this.departmentConfigs,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    
    this.updateDepartmentPositions();
    this.updateTierCounts();
    this.cdr.detectChanges();
  }

  private updateTierCounts(): void {
    this.departmentConfigs.forEach(config => {
      if (!config.tiers) {
        config.tiers = [];
      }
      config.tierCount = config.tiers.length;
      config.tiers = [...config.tiers];
    });
  }

  updateDepartmentPositions() {
    this.departmentConfigs.forEach((config, index) => {
      config.position = index + 1;
    });
  }

  onTierDrop(event: CdkDragDrop<TierConfig[]>, configIndex: number) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        this.departmentConfigs[configIndex].tiers,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    
    this.updateTierPositions(configIndex);
    this.updateTierCounts();
    this.cdr.detectChanges();
  }

  updateTierPositions(configIndex: number) {
    const config = this.departmentConfigs[configIndex];
    
    config.tiers.forEach((tier, index) => {
      tier.position = index + 1;
      
      if (tier.valueBasedConfig) {
        tier.valueBasedConfig.daTotal.sequenceCommercial = tier.position;
        tier.valueBasedConfig.daTotal.sequenceNonCommercial = tier.position;
        tier.valueBasedConfig.departmentTotal.sequenceCommercial = tier.position;
        tier.valueBasedConfig.departmentTotal.sequenceNonCommercial = tier.position;
      }
    });
    
    config.tierCount = config.tiers.length;
  }

  addTier(configIndex: number): void {
    const newPosition = this.departmentConfigs[configIndex].tiers.length + 1;
    const newTier: TierConfig = {
      tierName: '',
      selectedUsers: [],
      valueBasedApprovals: false,
      allApprovalRequired: false,
      position: newPosition,
      valueBasedConfig: {
        daTotal: {
          minCommercial: null,
          maxCommercial: null,
          sequenceCommercial: newPosition,
          minNonCommercial: null,
          maxNonCommercial: null,
          sequenceNonCommercial: newPosition
        },
        departmentTotal: {
          minCommercial: null,
          maxCommercial: null,
          sequenceCommercial: newPosition,
          minNonCommercial: null,
          maxNonCommercial: null,
          sequenceNonCommercial: newPosition
        }
      }
    };
    
    this.departmentConfigs[configIndex].tiers.push(newTier);
    this.updateTierCounts();
    this.cdr.detectChanges();
  }

  removeTier(configIndex: number, tierIndex: number): void {
    if (this.departmentConfigs[configIndex].tiers.length > 1) {
      this.departmentConfigs[configIndex].tiers.splice(tierIndex, 1);
      this.updateTierPositions(configIndex);
      this.updateTierCounts();
      this.cdr.detectChanges();
    }
  }

  openValueBasedModal(configIndex: number, tierIndex: number) {
    this.selectedConfigIndex = configIndex;
    this.selectedTierIndex = tierIndex;
    
    const tier = this.departmentConfigs[configIndex].tiers[tierIndex];
    
    if (!tier.valueBasedConfig) {
      tier.valueBasedConfig = {
        daTotal: {
          minCommercial: null,
          maxCommercial: null,
          sequenceCommercial: tier.position,
          minNonCommercial: null,
          maxNonCommercial: null,
          sequenceNonCommercial: tier.position
        },
        departmentTotal: {
          minCommercial: null,
          maxCommercial: null,
          sequenceCommercial: tier.position,
          minNonCommercial: null,
          maxNonCommercial: null,
          sequenceNonCommercial: tier.position
        }
      };
    }
    
    tier.valueBasedApprovals = true;
    this.showValueBasedModal = true;
  }

  closeValueBasedModal(): void {
    this.showValueBasedModal = false;
    this.selectedConfigIndex = -1;
    this.selectedTierIndex = -1;
  }

  saveValueBasedConfig(): void {
    if (this.selectedConfigIndex !== -1 && this.selectedTierIndex !== -1) {
      this.showValueBasedModal = false;
      this.selectedConfigIndex = -1;
      this.selectedTierIndex = -1;
    }
  }

  onValueBasedChange(configIndex: number, tierIndex: number, isChecked: boolean): void {
    const tier = this.departmentConfigs[configIndex].tiers[tierIndex];
    
    if (isChecked) {
      if (!tier.valueBasedConfig) {
        tier.valueBasedConfig = {
          daTotal: {
            minCommercial: null,
            maxCommercial: null,
            sequenceCommercial: tier.position,
            minNonCommercial: null,
            maxNonCommercial: null,
            sequenceNonCommercial: tier.position
          },
          departmentTotal: {
            minCommercial: null,
            maxCommercial: null,
            sequenceCommercial: tier.position,
            minNonCommercial: null,
            maxNonCommercial: null,
            sequenceNonCommercial: tier.position
          }
        };
      }
      
      this.selectedConfigIndex = configIndex;
      this.selectedTierIndex = tierIndex;
      this.showValueBasedModal = true;
    } else {
      tier.valueBasedApprovals = false;
    }
  }

  getUserDisplayName(user: User): string {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const email = user.email || user.userName || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName} (${email})`;
    } else if (user.name) {
      return `${user.name} (${email})`;
    } else {
      return `${user.shortName || user.userName} (${email})`;
    }
  }

  getCurrentTierName(): string {
    if (this.selectedConfigIndex !== -1 && this.selectedTierIndex !== -1) {
      const tier = this.departmentConfigs[this.selectedConfigIndex].tiers[this.selectedTierIndex];
      return tier.tierName || `Tier ${tier.position}`;
    }
    return '';
  }

  getUserDetailsForTier(departmentName: string, selectedUserIds: string[]): TierUserDetail[] {
    const departmentUsers = this.getUsersByDepartment(departmentName);
    
    return selectedUserIds.map(userId => {
      const user = departmentUsers.find(u => u.userId === userId);
      
      if (user) {
        return {
          userId: user.userId,
          userName: user.userName || user.name || user.shortName || 'Unknown'
        };
      }
      
      return {
        userId: userId,
        userName: 'Unknown'
      };
    });
  }

  buildSavePayload(config: DepartmentConfig): any {
    let departmentUUID = config.departmentId;
    
    // Check if departmentUUID exists and is a valid UUID string
    if (!departmentUUID || typeof departmentUUID !== 'string' || !departmentUUID.includes('-')) {
      departmentUUID = this.getDepartmentIdByName(config.department || config.deptName!);
    }
    
    const deptName = config.deptName || config.department;

    return {
      department: deptName,
      deptName: deptName,
      departmentId: departmentUUID,
      maskingName: config.maskingName,
      tierCount: config.tiers.length,
      position: config.position,
      tiers: config.tiers.map(tier => {
        const userDetails = this.getUserDetailsForTier(config.department, tier.selectedUsers);
        
        const tierPayload: any = {
          tierName: tier.tierName,
          selectedUsers: userDetails,
          valueBasedApprovals: tier.valueBasedApprovals,
          allApprovalRequired: tier.allApprovalRequired,
          position: tier.position
        };
        
        if (tier.valueBasedConfig) {
          tierPayload.valueBasedConfig = tier.valueBasedConfig;
        }
        
        return tierPayload;
      })
    };
  }

  buildCompletePayload(): InvoiceApprovalConfig {
    const departmentSettings = this.departmentConfigs.map(config => this.buildSavePayload(config));
    
    console.log("Complete payload departmentSettings:", departmentSettings);
    
    const payload: InvoiceApprovalConfig = {
      departmentSettings: departmentSettings
    };
    
    if (this.isEditMode && this.existingConfigId) {
      payload.invoiceapprovalId = this.existingConfigId;
    }
    
    return payload;
  }

  saveAllConfigurations(): void {
    const payload = this.buildCompletePayload();
    
    console.log("=== FINAL PAYLOAD TO BE SENT ===");
    console.log(JSON.stringify(payload, null, 2));
    console.log("================================");
    
    if (this.isEditMode && this.existingConfigId) {
      this.commonService.UpdateToST("invoiceapproval/"+ this.existingConfigId, payload).subscribe(
        response => {
          console.log('Configuration updated successfully', response);
          this.refreshData();
        },
        error => {
          console.error('Error updating configuration:', error);
        }
      );
    } else {
      this.commonService.addToST("invoiceapproval", payload).subscribe(
        response => {
          console.log('Configuration created successfully', response);
          
          if (response?.invoiceapprovalId || response?._id) {
            this.existingConfigId = response.invoiceapprovalId || response._id;
            this.isEditMode = true;
          }

          this.refreshData();
        },
        error => {
          console.error('Error creating configuration:', error);
        }
      );
    }
  }

  deleteConfig(configIndex: number): void {
    if (confirm('Are you sure you want to delete this configuration?')) {
      this.departmentConfigs.splice(configIndex, 1);
      this.updateDepartmentPositions();
      this.updateTierCounts();
      this.cdr.detectChanges();
    }
  }

  isConfigValid(config: DepartmentConfig): boolean {
    return config.department && 
           config.maskingName && 
           config.tiers.length > 0 &&
           config.tiers.every(tier => 
             tier.tierName.trim() !== '' && 
             tier.selectedUsers && 
             tier.selectedUsers.length > 0
           );
  }

  getTierSummary(configIndex: number): string {
    const config = this.departmentConfigs[configIndex];
    return config.tiers.map(tier => `${tier.tierName}(${tier.position})`).join(' → ');
  }

  getDepartmentSummary(): string {
    return this.departmentConfigs.map(config => `${config.department}(${config.position})`).join(' → ');
  }

  getDepartmentSummaryWithUsers(): string {
    return this.departmentConfigs.map(config => 
      `${config.department}(${config.position}) - ${this.getUserCountByDepartment(config.department)} users`
    ).join(' → ');
  }

  resetAllPositions() {
    this.updateDepartmentPositions();
    this.departmentConfigs.forEach((config, configIndex) => {
      this.updateTierPositions(configIndex);
    });
    console.log('All positions have been reset');
  }

  getConfigurationState() {
    const state = {
      isEditMode: this.isEditMode,
      configId: this.existingConfigId,
      departmentCount: this.departmentConfigs.length,
      departments: this.departmentConfigs.map(config => ({
        name: config.department,
        deptName: config.deptName,
        departmentId: config.departmentId,
        position: config.position,
        tierCount: config.tiers.length,
        userCount: this.getUserCountByDepartment(config.department),
        tiers: config.tiers.map(tier => ({
          name: tier.tierName,
          position: tier.position,
          userCount: tier.selectedUsers.length,
          hasValueBasedConfig: !!tier.valueBasedConfig
        }))
      }))
    };
    
    console.log('Current Configuration State:', state);
    return state;
  }

  refreshData(): void {
    this.isLoading = true;
    this.loadingMessage = 'Refreshing data...';
    this.loadExistingConfiguration();
  }

  departmentHasUsers(departmentName: string): boolean {
    return this.getUserCountByDepartment(departmentName) > 0;
  }

  getAvailableUsers(configIndex: number, currentTierIndex: number): User[] {
    const config = this.departmentConfigs[configIndex];
    const departmentUsers = this.getUsersByDepartment(config.department);

    const selectedInOtherTiers = config.tiers
      .filter((_, index) => index !== currentTierIndex)
      .reduce((acc, tier) => {
        return acc.concat(tier.selectedUsers || []);
      }, [] as string[]);

    return departmentUsers.filter(user => !selectedInOtherTiers.includes(user.userId));
  }
}