import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-api-progress-bar',
  templateUrl: './api-progress-bar.component.html',
  styleUrls: ['./api-progress-bar.component.scss']
})
export class ApiProgressBarComponent implements OnInit, OnChanges {

  @Input() totalCount: number = 0;
  @Input() pageSize: number = 30;
  @Input() loadedCount: number = 0;

  percentage: number = 0;
  totalCalls: number = 0;
  completedCalls: number = 0;
  currentCall: number = 0;
  status: string = 'not-started';

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.calculateProgress();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalCount'] || changes['pageSize'] || changes['loadedCount']) {
      this.calculateProgress();
      this.cdr.detectChanges();
    }
  }

  calculateProgress(): void {
    // Handle edge case: no data
    if (this.totalCount === 0 || this.pageSize === 0) {
      this.percentage = 0;
      this.totalCalls = 0;
      this.completedCalls = 0;
      this.currentCall = 0;
      this.status = 'not-started';
      return;
    }

    // Calculate total number of API calls needed
    this.totalCalls = Math.ceil(this.totalCount / this.pageSize);
    
    // Calculate how many API calls have been completed
    this.completedCalls = Math.floor(this.loadedCount / this.pageSize);
    
    // Current call being processed
    this.currentCall = this.completedCalls + 1;
    
    // Calculate percentage (cap at 100%)
    this.percentage = Math.min(100, Math.round((this.loadedCount / this.totalCount) * 100));

    // Determine status
    if (this.loadedCount >= this.totalCount) {
      this.status = 'completed';
    } else if (this.loadedCount > 0) {
      this.status = 'in-progress';
    } else {
      this.status = 'not-started';
    }
  }

  getStatusColor(): string {
    switch (this.status) {
      case 'completed':
        return '#28a745'; // Green
      case 'in-progress':
        return '#007bff'; // Blue
      case 'not-started':
        return '#e9ecef'; // Light gray
      default:
        return '#e9ecef';
    }
  }

  getStatusText(): string {
    switch (this.status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'Loading...';
      case 'not-started':
        return 'Not Started';
      default:
        return '';
    }
  }
}