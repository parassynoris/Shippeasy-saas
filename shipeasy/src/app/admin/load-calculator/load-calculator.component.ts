import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';

@Component({
  selector: 'app-load-calculator',
  templateUrl: './load-calculator.component.html',
  styleUrls: ['./load-calculator.component.scss']
})
export class LoadCalculatorComponent implements OnInit {
  cargoTypes = [
    { name: 'box', displayName: 'Box', icon: 'assets/img/load-calc/box.svg' },
    { name: 'bigbags', displayName: 'Bigbags', icon: 'assets/img/load-calc/bigbags.svg' },
    { name: 'sacks', displayName: 'Sacks', icon: 'assets/img/load-calc/sacks (1).svg' },
    { name: 'barrels', displayName: 'Barrels', icon: 'assets/img/load-calc/barrels1.svg' },
    { name: 'roll', displayName: 'Roll', icon: 'assets/img/load-calc/rolls.svg' },
    { name: 'pipes', displayName: 'Pipes', icon: 'assets/img/load-calc/rolls.svg' },
  ];
  activegroupId = 0;
  containers = [
    {
      name: '20\' Standard',
      imageUrl: 'assets/img/load-calc/Container/20st.svg',
      il: '5.895 m',
      iw: '2.350 m',
      ih: '2.392 m',
      doorWidth: '2.340 m',
      doorHeight: '2.292 m',
      cap: '33 m3',
      tareWeight: '2230 Kgs',
      maxh: '28230 Kgs',
      p1: 'Standard containers are also known as general purpose containers.',p2: 'They are closed containers, i.e. they are closed on all sides. A distinction may be drawn between the following types of standard container:',p3: 'In addition, the various types of standard container also differ in dimensions and weight, resulting in a wide range of standard containers.',p4: 'Standard containers are mainly used as 20` and 40` containers. Containers with smaller dimensions are very seldom used. Indeed, the trend is towards even longer dimensions, e.g. 45.', li1:'Standard containers with doors at one or both end(s)',li2:'Standard containers with doors at one or both end(s) and doors over the entire length of one or both sides',li3:'Standard containers with doors at one or both end(s) and doors on one or both sides',
    },
    { name: '40\' Standard', imageUrl: 'assets/img/load-calc/Container/40st.svg'
    ,il: '12.029 m',
    iw: '2.350 m',
    ih: '2.392 m',
    doorWidth: '2.340 m',
    doorHeight: '2.292 m',
    cap: '67 m3',
    tareWeight: '3780 Kgs',
    maxh: '26700 Kgs',
    p1: 'Standard containers are also known as general purpose containers.',p2: 'They are closed containers, i.e. they are closed on all sides. A distinction may be drawn between the following types of standard container:',p3: 'In addition, the various types of standard container also differ in dimensions and weight, resulting in a wide range of standard containers.',p4: 'Standard containers are mainly used as 20` and 40` containers. Containers with smaller dimensions are very seldom used. Indeed, the trend is towards even longer dimensions, e.g. 45`.', li1:'Standard containers with doors at one or both end(s)',li2:'Standard containers with doors at one or both end(s) and doors over the entire length of one or both sides',li3:'Standard containers with doors at one or both end(s) and doors on one or both sides' },
    { name: '40\' HIGH-CUBE', imageUrl: 'assets/img/load-calc/Container/40hq.svg' ,il: '12.024 m',
    iw: '2.350 m',
    ih: '2.697 m',
    doorWidth: '2.340 m',
    doorHeight: '2.597 m',
    cap: '76 m3',
    tareWeight: '4020 Kgs',
    maxh: '26700 Kgs',
    p1: 'High-cube containers are similar in structure to standard containers, but taller. In contrast to standard containers, which have a maximum height of 2591 mm (8`6"), high-cube containers are 2896 mm, or 9`6", tall. High-cube containers are for the most part 40` long, but are sometimes made as 45` containers.',p2: 'A number of lashing rings, capable of bearing loads of at most 1000 kg, are mounted on the front top end rail and bottom cross member and the corner posts.',p3: 'Many 40` containers have a recess in the floor at the front end which serves to center the containers on so-called gooseneck chassis. These recesses allow the containers to lie lower and therefore to be of taller construction.'
   },
    { name: '45\' HIGH-CUBE', imageUrl: 'assets/img/load-calc/Container/45hq.svg',il: '13.556 m',
    iw: '2.352 m',
    ih: '2.700 m',
    doorWidth: '2.340 m',
    doorHeight: '2.597 m',
    cap: '86 m3',
    tareWeight: '4800 Kgs',
    maxh: '27700 Kgs',
    p1: 'High-cube containers are similar in structure to standard containers, but taller. In contrast to standard containers, which have a maximum height of 2591 mm (8`6"), high-cube containers are 2896 mm, or 9`6", tall. High-cube containers are for the most part 40` long, but are sometimes made as 45` containers.',p2: 'A number of lashing rings, capable of bearing loads of at most 1000 kg, are mounted on the front top end rail and bottom cross member and the corner posts.',p3: 'Many 40` containers have a recess in the floor at the front end which serves to center the containers on so-called gooseneck chassis. These recesses allow the containers to lie lower and therefore to be of taller construction.'},
    { name: '20\' OPEN TOP', imageUrl: 'assets/img/load-calc/Container/20op.svg',il: '5.888 m',
    iw: '2.345 m',
    ih: '2.315 m',
    doorWidth: '2.286 m',
    doorHeight: '2.184 m',
    cap: '32 m3',
    tareWeight: '2250 Kgs',
    maxh: '30480 Kgs',
    p1: 'The walls of open-top containers are generally made of corrugated steel. The floor is made of wood.',p2: 'It has the following typical distinguishing structural features. The roof consists of removable bows and a removable tarpaulin. The door header may be swivelled out.',p3: 'These two structural features greatly simplify the process of packing and unpacking the container. In particular, it is very easy to pack and unpack the container from above or through the doors by crane or crab when the roof is open and the door header is swivelled out.',p4:'It should be noted, however, that the purpose of the roof bows of an open-top container is not solely to support the tarpaulin but also to contribute to container stability. Flatracks are therefore more suitable for overheight cargoes.',p5:'Lashing rings, to which the cargo may be secured, are installed in the upper and lower side rails and the corner posts. The lashing rings may take loads of up to 1,000 kg.'},
    { name: '40\' OPEN TOP', imageUrl: 'assets/img/load-calc/Container/40op.svg', il: '12.029 m',
    iw: '2.342 m',
    ih: '2.326 m',
    doorWidth: '2.341 m',
    doorHeight: '2.274 m',
    cap: '65 m3',
    tareWeight: '3810 Kgs',
    maxh: '26670 Kgs',
    p1: 'The walls of open-top containers are generally made of corrugated steel. The floor is made of wood.',p2: 'It has the following typical distinguishing structural features. The roof consists of removable bows and a removable tarpaulin. The door header may be swivelled out.',p3: 'These two structural features greatly simplify the process of packing and unpacking the container. In particular, it is very easy to pack and unpack the container from above or through the doors by crane or crab when the roof is open and the door header is swivelled out.',p4:'It should be noted, however, that the purpose of the roof bows of an open-top container is not solely to support the tarpaulin but also to contribute to container stability. Flatracks are therefore more suitable for overheight cargoes.',p5:'Lashing rings, to which the cargo may be secured, are installed in the upper and lower side rails and the corner posts. The lashing rings may take loads of up to 1,000 kg.'},
    { name: '20\' REFRIGERATED', imageUrl: 'assets/img/load-calc/Container/20ref.svg', il: '5.724 m',
    iw: '2.286 m',
    ih: '2.014 m',
    doorWidth: '2.286 m',
    doorHeight: '2.067 m',
    cap: '26 m3',
    tareWeight: '2550 Kgs',
    maxh: '21450 Kgs',
    p1: 'The refrigeration unit is arranged in such a way that the external dimensions of the container meet ISO standards and thus fit into the container ship cell guides, for example. The presence of an integral refrigeration unit entails a loss of internal volume and payload.',
    p2: 'When being transported by ship, integral units have to be connected to the on-board power supply system. The number of refrigerated containers which may be connected depends on the capacity of the ship`s power supply system. If the aforesaid capacity is too low for the refrigerated containers to be transported, "power packs" may be used, which are equipped with relatively large diesel generators and satisfy ISO requirements with regard to the dimensions of a 20` container. When at the terminal, the containers are connected to the terminal`s power supply system. For transport by road and rail, most integral unit refrigeration units are operated by a generator set (genset). This may either be a component of the refrigeration unit or connected to the refrigeration unit.',
    p3: 'Air flows through the container from bottom to top. In general, the "warm" air is drawn off from the inside of the container, cooled in the refrigeration unit and then blown back in the container as cold air.',
    p4: 'In the upper area of the container, adequate space (at least 12 cm) must likewise be provided for air flow. For this purpose, during packing of the container adequate free space must be left above the cargo. The maximum load height is marked on the side walls.',
    p5: 'To ensure vertical air flow from bottom to top, packaging must also be appropriately designed and the cargo must be sensibly stowed.',
    p6: 'In addition to temperature regulation, integral units also allow a controlled fresh air exchange, for example for the removal of metabolic products such as CO2 and ethylene in the case of the transport of fruits.',
    p7: 'In the refrigeration units, both the supply and return air temperatures are measured and, depending on the operating mode, one of these values is used to control the cold air. Temperature measurement may be performed in various ways. The Partlow recorder generally records return air temperature, since this provides an indication of the state or temperature of the cargo. Data loggers are increasingly used, which detect temperature digitally and indicate it on a display. Once transferred to a PC, the data may then be evaluated.',
    p8: 'The temperature display is attached to the outside of the refrigeration unit, so that operation of the unit may be checked at any time.',
    p9: 'Digital or analog recorders may also be positioned directly in the cargo, so as to measure temperatures inside the container. The recorder should be accommodated in such a way that it records the temperatures at risk points in the container (inside the packaging, top layer at door end).',
    p10: 'Integral units may be stowed both above and below deck on a ship. Above deck stowage has the advantage that the heat from return air may be more readily dissipated. However, the containers are often exposed to strong solar radiation, leading to increased refrigeration capacity requirements.',
    p11: 'Refrigerated containers are used for goods which need to be transported at a constant temperature above or below freezing point. These goods are divided into chilled goods and frozen goods, depending on the specified transport temperature. They principally include fruit, vegetables, meat and dairy products, such as butter and cheese.',
    p12: 'High-cube integral units are used in particular for voluminous and light goods (e.g. fruit, flowers).',
    p13: 'Nowadays, goods requiring refrigeration are mostly transported in integral units, which have a markedly higher market share than porthole containers.',p14: 'Chilled meat is sometimes also transported hanging, for which purpose the ceilings of refrigerated containers are equipped with special hook rails' },
    { name: '40\' REFRIGERATED', imageUrl: 'assets/img/load-calc/Container/40ref.svg', il: '11.840 m',
    iw: '2.286 m',
    ih: '2.120 m',
    doorWidth: '2.286 m',
    doorHeight: '2.195 m',
    cap: '60 m3',
    tareWeight: '3850 Kgs',
    maxh: '26630 Kgs',
    p1: 'The refrigeration unit is arranged in such a way that the external dimensions of the container meet ISO standards and thus fit into the container ship cell guides, for example. The presence of an integral refrigeration unit entails a loss of internal volume and payload.',
    p2: 'When being transported by ship, integral units have to be connected to the on-board power supply system. The number of refrigerated containers which may be connected depends on the capacity of the ship`s power supply system. If the aforesaid capacity is too low for the refrigerated containers to be transported, "power packs" may be used, which are equipped with relatively large diesel generators and satisfy ISO requirements with regard to the dimensions of a 20` container. When at the terminal, the containers are connected to the terminal`s power supply system. For transport by road and rail, most integral unit refrigeration units are operated by a generator set (genset). This may either be a component of the refrigeration unit or connected to the refrigeration unit.',
    p3: 'Air flows through the container from bottom to top. In general, the "warm" air is drawn off from the inside of the container, cooled in the refrigeration unit and then blown back in the container as cold air.',
    p4: 'In the upper area of the container, adequate space (at least 12 cm) must likewise be provided for air flow. For this purpose, during packing of the container adequate free space must be left above the cargo. The maximum load height is marked on the side walls.',
    p5: 'To ensure vertical air flow from bottom to top, packaging must also be appropriately designed and the cargo must be sensibly stowed.',
    p6: 'In addition to temperature regulation, integral units also allow a controlled fresh air exchange, for example for the removal of metabolic products such as CO2 and ethylene in the case of the transport of fruits.',
    p7: 'In the refrigeration units, both the supply and return air temperatures are measured and, depending on the operating mode, one of these values is used to control the cold air. Temperature measurement may be performed in various ways. The Partlow recorder generally records return air temperature, since this provides an indication of the state or temperature of the cargo. Data loggers are increasingly used, which detect temperature digitally and indicate it on a display. Once transferred to a PC, the data may then be evaluated.',
    p8: 'The temperature display is attached to the outside of the refrigeration unit, so that operation of the unit may be checked at any time.',
    p9: 'Digital or analog recorders may also be positioned directly in the cargo, so as to measure temperatures inside the container. The recorder should be accommodated in such a way that it records the temperatures at risk points in the container (inside the packaging, top layer at door end).',
    p10: 'Integral units may be stowed both above and below deck on a ship. Above deck stowage has the advantage that the heat from return air may be more readily dissipated. However, the containers are often exposed to strong solar radiation, leading to increased refrigeration capacity requirements.',
    p11: 'Refrigerated containers are used for goods which need to be transported at a constant temperature above or below freezing point. These goods are divided into chilled goods and frozen goods, depending on the specified transport temperature. They principally include fruit, vegetables, meat and dairy products, such as butter and cheese.',
    p12: 'High-cube integral units are used in particular for voluminous and light goods (e.g. fruit, flowers).',
    p13: 'Nowadays, goods requiring refrigeration are mostly transported in integral units, which have a markedly higher market share than porthole containers.',p14: 'Chilled meat is sometimes also transported hanging, for which purpose the ceilings of refrigerated containers are equipped with special hook rails'},
    { name: 'CUSTOM CONTAINER', imageUrl: 'assets/img/load-calc/Container/20st.svg', il: '5.895 m',
    iw: '2.350 m',
    ih: '2.392 m',
    doorWidth: '2.340 m',
    doorHeight: '2.292 m',
    cap: '33 m3',
    tareWeight: '2230 Kgs',
    maxh: '28230 Kgs'},
    // Add other containers
  ];

  trucks = [
    { name: 'TAUTLINER (CURAINSIDER)', imageUrl: 'assets/img/load-calc/truck/tautliner (1).svg', description: 'These are similar to the Euroliners, with sliding roofs, sliding curtains and solid rear doors but do not have side gates or sideboards. The Tautliner has all-round flexibility for loading and unloading from the rear, sides and overhead.', il:'13.600 m', iw:'2.500 m', ih:'2.650 m', cap:'90 m3', maxh:'24500 Kgs'},
    { name: 'REFRIGERATED TRUCK', imageUrl: 'assets/img/load-calc/truck/refrigerated.svg', description: 'Semi-trailers equipped with a refrigeration unit provide automatic temperature controls. Designed for the transportation of goods requiring deep freezing or cooling. Deep-frozen products, such as carcasses on hooks and fish, are transported at temperatures ranging from -24 to -12 degrees Celsius.For the transportation of chilled animal or vegetable products, you can use the -6 to 0 degree mode.' , il:'13.600 m', iw:'2.500 m', ih:'2.650 m', cap:'90 m3', maxh:'24500 Kgs'},
    { name: 'ISOTHERAM TRUCK', imageUrl: 'assets/img/load-calc/truck/isotherm.svg', description: 'The cargo compartment of the semi-trailer is thermally insulated but not equipped with a refrigeration unit. Designed for short-term transportation of perishable goods, it maintains the desired internal temperature for a limited time.' , il:'13.360 m', iw:'2.600 m', ih:'2.650 m', cap:'92 m3', maxh:'22000 Kgs'},
    { name: 'MEGA-TRAILER', imageUrl: 'assets/img/load-calc/truck/mega_trailer.svg', description: 'Mega curtainsiders feature a massive 100m³ capacity. The larger internal height enables shippers to maximize consignment size whilst having the benefits of a straight frame loading bed. All trailers have easy loading and discharge via open side and rear door access including sliding and lifting roof. They are also equipped with 32 sideboards.' , il:'13.600 m', iw:'2.470 m', ih:'3.000 m', cap:'100 m3', maxh:'32800 Kgs'},
    { name: 'JUMBO', imageUrl: 'assets/img/load-calc/truck/jumbo.svg', description: 'The term jumbo refers to a special large type of truck and the transports carried out with these trucks. The jumbo trucks, unlike regular trucks, offer a much larger load volume. Therefore, the jumbo trucks naturally transport goods that occupy a great deal of volume and are also frequently used in the automotive industry due to the loading height of 3 meters.', il:'8.000 m', iw:'2.480 m', ih:'2.950 m', cap:'120 m3', maxh:'23000 Kgs' },
    { name: 'CUSTOM TRUCK', imageUrl: 'assets/img/load-calc/truck/tautliner (1).svg', description: '' , il:'13.600 m', iw:'2.500 m', ih:'2.650 m', cap:'90 m3', maxh:'24500 Kgs'},
    // Add other trucks
  ];
  selectedTruck: any = this.trucks[0]; // Default selected truck
  selectedContainer: any = this.containers[0]; // Default selected truck
  containerTruckForm: FormGroup;
  truckSelected: boolean = false;
  containerSelected: boolean = false;
  truckSelected1: boolean = false;
  containerSelected1: boolean = false;

  // Function to set the selected truck
  selectTruck(truck: any) {
    this.selectedTruck = truck;  
    this.truckSelected = true;
    this.containerSelected = false;
  }
  // Function to set the selected container
  selectContainer(container: any) {
    this.selectedContainer = container;
    this.containerSelected = true;
    this.truckSelected = false;
  }
  selectedTabIndex: number = 0;
  selectTab(tab: string) {
    this.selectedTab = tab;

    // Check if Learn More view is active
    if (this.learnMoreVisible) {
      // Automatically select the first item in the new tab
      if (this.selectedTab === 'container') {
        this.openLearnMore(this.containers[0]); // Open Learn More for first container
      } else if (this.selectedTab === 'truck') {
        this.openLearnMore(this.trucks[0]); // Open Learn More for first truck
      }
    } else {
      this.learnMoreVisible = false; // Reset Learn More view
    }
  }
  goToPreviousTab(): void {
    if (this.selectedTabIndex > 0) {
      this.selectedTabIndex--;
    }
  }

  // Method to go to the next tab
  goToNextTab(): void {
    if (this.selectedTabIndex < 2) { // Ensure it doesn't exceed the last tab index
      this.selectedTabIndex++;
    }
  }

  selectItem(item: any) {
    this.selectedContainer = item;
    this.selectedTruck = item;
  }
  
  isContainerSelected(container: any): boolean {
    return this.selectedContainer === container; // Check if the container is selected
  }
  isTruckSelected(truck: any): boolean {
    return this.selectedTruck === truck; // Check if the container is selected
  }

  openLearnMore(item: any) {
    this.selectedItem = item;
    this.learnMoreVisible = true; // Show Learn More screen
  }

  closeLearnMore() {
    this.learnMoreVisible = false; // Close Learn More view
  }

  goBack() {
    this.learnMoreVisible = false; // Return to the list view
  }

  addItem(item: any) {
    this.selectedItems.push(item);
    this.closeLearnMore();
  }

  cancel1() {
    console.log('Cancelled');
  }


  selectedTab: string = 'container';  // Default tab
  selectedItem: any = null;
  selectedItems: any[] = [];
  learnMoreVisible: boolean = false;
  // Default selected cargo type
  selectedCargoType = 'box';

  // Cargo details
  productName = '';
  productColor = '#00FF00';
  cargoDiameter = 100;
  cargoHeight = 100;
  cargoWeight = 1;
  cargoQuantity = 1;
  isEdit: boolean = false; // Ensure this is initialized
  productIndex: number | null = null;

  // Method to predict something (based on your logic)
  predict() {
    // Prediction logic here
    console.log('Predicting...');
  }

  // Save method
  save() {
    console.log('Saving cargo data...');
  }
  onProductFormSubmit(): void {
    if (this.isEdit && this.productIndex !== null) {
        // If in edit mode, update the product
        this.updateProductInGroup(this.activegroupId, this.productIndex, this.AddproductForm.value);
    } else {
        // If not in edit mode, add a new product
        this.addProductToGroup(this.activegroupId, this.AddproductForm.value);
    }
    this.closeModal(); 
}

addProductToGroup(groupIndex: number, productData: any): void {
    const group = this.groups.at(groupIndex) as FormGroup; // Get the group by index
    const products = group.get('products') as FormArray;   // Access the products FormArray within the group
    const product = this.fb.group({
      productType:[this.selectedCargoType],
        productName: [productData.productName],
        length: [productData.lengthh],
        width: [productData.width],
        height: [productData.height],
        weight: [productData.weight],
        quantity: [productData.quantity],
        diameter: [productData.diameter],
    });
  
    products.push(product); // Add the product to the products array
}

updateProductInGroup(groupIndex: number, productIndex: number, productData: any): void {
    const group = this.groups.at(groupIndex) as FormGroup; // Get the group by index
    const products = group.get('products') as FormArray;   // Access the products FormArray within the group
    const product = products.at(productIndex) as FormGroup; // Get the specific product FormGroup

    // Update the product's values
    product.patchValue({
        productName: productData.productName,
        length: productData.lengthh,
        width: productData.width,
        height: productData.height,
        weight: productData.weight,
        quantity: productData.quantity,
        diameter: productData.diameter,
    });
}


  // Cancel method
  cancel() {
    console.log('Canceling...');
  }

  groupForm: FormGroup;
  AddproductForm: FormGroup;
  show: any;

  constructor(private fb: FormBuilder, public modalService: NgbModal, private commonService : CommonService, public notification: NzNotificationService) {}

  ngOnInit(): void {
    this.groupForm = this.fb.group({
      groups: this.fb.array([]) // FormArray to hold groups
    });
    this.containerTruckForm = this.fb.group({
      items: this.fb.array([])  // This will hold trucks and containers
    });
  }
  get items(): FormArray {
    return this.containerTruckForm.get('items') as FormArray;
  }
  saveData(){
    if(this.groupForm.valid && this.containerTruckForm.valid){
    let payload = {
      products :this.groupForm.controls['groups'].value,
      
      [this.truckSelected1?"trucks":"containers"] :this.containerTruckForm.controls['items'].value,
    }
    
    this.commonService.getSTList1("load-calculate", payload)?.subscribe(
      (res: any) => {
        if (res) {
          this.notification.create('success', 'Added Successfully', '');
          setTimeout(() => {
            // Optionally fetch updated data or take other actions
          }, 1000);
        }
        this.goToNextTab();
      },
      (error) => {
        this.notification.create('error', error?.error?.error, '');
      }
      );
    }

  }
  createItem(item: any): FormGroup {
    return this.fb.group({
      name: [item.name, Validators.required],
      imageUrl: [item.imageUrl],
      il: [item.il],  // Inside length
      iw: [item.iw],  // Inside width
      ih: [item.ih],  // Inside height
      cap: [item.cap], // Capacity
      maxh: [item.maxh]  // Max weight or other relevant data
    });
  }
  addItemToForm() {
    if (this.selectedContainer) {
      this.items.push(this.createItem(this.selectedContainer));
      this.closeModal();  // Close modal after adding
    }
  }
  confirmSelection() {
    if (this.truckSelected) {
      this.containerSelected1 = false;
      this.truckSelected1 = true;
      this.addTruckToList(this.selectedTruck);
    } else if (this.containerSelected) {
      this.containerSelected1 = true;
      this.truckSelected1 = false;
      this.addContainerToList(this.selectedContainer);
    }

    // Reset selection flags after adding
    this.closeModal(); 
    this.truckSelected = false;
    this.containerSelected = false;
    this.selectedTruck = null;
    this.selectedContainer = null;
  }
  addTruckToList(truck: any) {
    const truckGroup = this.fb.group({
      type: 'truck',
      name: truck.name,
      imageUrl: truck.imageUrl,
      il: truck.il,  // Inside length
      iw: truck.iw,  // Inside width
      ih: truck.ih,  // Inside height
      cap: truck.cap, // Capacity
      maxh: truck.maxh,
      count:[1]
    });
    this.items.push(truckGroup);
  }

  // Add selected container to FormArray
  addContainerToList(container: any) {
    const containerGroup = this.fb.group({
      type: 'container',
      name: container.name,
      imageUrl: container.imageUrl,
      il: container.il,  // Inside length
      iw: container.iw,  // Inside width
      ih: container.ih,  // Inside height
      cap: container.cap, // Capacity
      maxh: container.maxh,
      count:[1]
    });
    this.items.push(containerGroup);
  }

  // Getter for accessing groups FormArray
  get groups(): FormArray {
    return this.groupForm.get('groups') as FormArray;
  }

  // Method to add a new group
  addGroup(): void {
    const index = this.groups.length;
    const group = this.fb.group({
      groupName: [{ value: `Group#${index + 1}`, disabled: true }],
      products: this.fb.array([]) // FormArray to hold products within a group
    });
    this.groups.push(group);
  }

  enableGroupName(index: number) {
    const group = this.groups.at(index);
    group.get('groupName').enable();  // Enable the groupName field
  }
  // Method to remove a group
  removeGroup(index: number): void {
    this.groups.removeAt(index);
  }

  // Getter for accessing products in a specific group
  getProducts(groupIndex: number): FormArray {
    return this.groups.at(groupIndex).get('products') as FormArray;
  }

  // Method to add a product to a specific group

  // Method to remove a product from a group
  removeProduct(groupIndex: number, productIndex: number): void {
    this.getProducts(groupIndex).removeAt(productIndex);
  }

  // Submit method to log the entire form
  onSubmit(): void {
    console.log(this.groupForm.value);
  }
  open(content, groupId: number, isEdit: boolean = false, productIndex: number | null = null) {
    this.isEdit = isEdit;
    this.activegroupId = groupId;
    this.productIndex = productIndex; 

    // Initialize the form with empty values
    this.AddproductForm = this.fb.group({
        lengthh: [''],
        diameter: [''],
        width: [''],
        height: [''],
        heightBarrels: [''],
        cargoType: [''],
        spacingTilttoLength: [false],
        tiltWidth: [false],
        layerCount: [false],
        layerCount1: [''],
        mass: [false],
        mass1: [''],
        spacingHeigth: [false],
        spacingHeigth1: [''],
        disableStack: [false],
        disableStack1: [false],
        sqare: [false],
        hexagon: [false],
        weight: [''],
        quantity: [''],
        productName: ['']
    });

    // If editing, patch the form with existing product data
    if (isEdit && productIndex !== null) {
        const group = this.groups.at(groupId) as FormGroup;
        const products = group.get('products') as FormArray;
        const productData = products.at(productIndex).value;

        // Patch the data into the form
        this.AddproductForm.patchValue({
            productName: productData.productName,
            lengthh: productData.length,
            width: productData.width,
            height: productData.height,
            weight: productData.weight,
            quantity: productData.quantity,
            diameter: productData.diameter
        });
    }

    // Open the modal with the updated form
    this.modalService.open(content, {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: 'lg',
        windowClass: 'no-padding-modal',
    });
}

  open1(content2, showTab: string) {
    this.isEdit = false;
  
    // Set the tab based on the button clicked (showTab will be either 'truck' or 'container')
    if (showTab === 'truck') {
      this.selectedTab = 'truck';
    } else if (showTab === 'container') {
      this.selectedTab = 'container';
    }
  
    // Ensure Learn More view is reset each time the modal opens
    this.learnMoreVisible = false;
  
    // Open the modal with the provided settings
    this.modalService.open(content2, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'xl',
      windowClass: 'no-padding-modal',
    });
  }
  closeModal() {
    this.modalService.dismissAll();
  }
  incrementCount(i: number): void {
    const group = this.items.at(i);  // Access the group at index `i`
    if (!group) {
      console.error(`Form group not found at index ${i}`);
      return;
    }
  
    const countControl = group.get('count') as FormControl;  // Access the 'count' form control
    if (!countControl) {
      console.error(`Count control not found in form group at index ${i}`);
      return;
    }
  
    // Increment the count
    const currentValue = countControl.value || 0;
    countControl.setValue(currentValue + 1);
  }
  
  decrementCount(i: number): void {
    const group = this.items.at(i);
    if (!group) {
      console.error(`Form group not found at index ${i}`);
      return;
    }
  
    const countControl = group.get('count') as FormControl;
    if (!countControl) {
      console.error(`Count control not found in form group at index ${i}`);
      return;
    }
  
    // Decrement the count (don't go below 0)
    const currentValue = countControl.value || 0;
    if (currentValue > 0) {
      countControl.setValue(currentValue - 1);
    }
  }
  removeItem(index: number): void {
    const itemsArray = this.items; // Get the FormArray
    if (itemsArray.length > 0) {
      itemsArray.removeAt(index);  // Remove the item at the specified index
    }
    if (itemsArray.length === 0) {
      this.containerSelected1 = false;
      this.truckSelected1 = false;
    }
  }
  
}