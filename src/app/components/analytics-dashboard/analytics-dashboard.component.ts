import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { FormsModule } from '@angular/forms';
import { TeamMetrics } from '../../models/team-metrics.model';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.css']
})
export class AnalyticsDashboardComponent implements AfterViewInit {
  @ViewChild('myChart', { static: false }) myChart!: ElementRef<HTMLCanvasElement>;
  
  chart: any;
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  selectedProject: string = '';
  productivityData: { total: number; done: number; pending: number; efficiency: number } | any = null;
  teamMetrics!: TeamMetrics[];
  
  deadlineAdherence: number = 100;          
  memberDeadlineAdherence: number = 100;      
  
  currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  
  constructor(
    private taskService: TaskService
  ) {
    this.taskService.getTasks().subscribe(tasks => {
      if (this.currentUser?.role === 'Manager') {
        this.tasks = tasks;
      } else {
        this.tasks = tasks.filter(task => task.assignedTo === this.currentUser.email);
      }
      this.filteredTasks = this.tasks;
      this.calculateProductiveMetrics();
      this.calculateDeadlineAdherence();
      this.updateChartData();
    });
  }
  
  ngAfterViewInit(): void {
    const canvas = this.myChart.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not available.');
      return;
    }
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Completed', 'Pending'],
        datasets: [
          {
            label: 'Tasks',
            data: [
              this.tasks.filter(t => t.status === 'Done').length,
              this.tasks.filter(t => t.status !== 'Done').length
            ],
            backgroundColor: ['rgba(75,192,192,0.6)', 'rgba(255,99,132,0.6)']
          }
        ]
      }
    });
  }
  
  updateChartData(): void {
    if (this.chart) {
      this.chart.data.datasets[0].data = [
        this.tasks.filter(t => t.status === 'Done').length,
        this.tasks.filter(t => t.status !== 'Done').length
      ];
      this.chart.update();
    }
  }
  
  calculateProductiveMetrics(): void {
    if (!this.selectedProject) {
      this.productivityData = null;
      return;
    }
    const projTasks = this.tasks.filter(t => t.project === this.selectedProject);
    const metrics = { total: projTasks.length, done: 0, pending: 0, efficiency: 0 };
    projTasks.forEach(task => {
      if (task.status === 'Done') {
        metrics.done++;
      } else {
        metrics.pending++;
      }
    });
    metrics.efficiency = metrics.total > 0 ? Math.round((metrics.done / metrics.total) * 100) : 0;
    this.productivityData = metrics;
  }
  
  calculateDeadlineAdherence(): void {
    const tasksWithDueDate = this.tasks.filter(t => t.dueDate);
    if (tasksWithDueDate.length === 0) {
      this.deadlineAdherence = 100;
      this.memberDeadlineAdherence = 100;
      return;
    }
    
    const now = new Date();
    let onTimeCount = 0;
    tasksWithDueDate.forEach(task => {
      const due = new Date(task.dueDate!);
      if (due >= now || task.status === 'Done') {
        onTimeCount++;
      }
    });
    const adherence = Math.round((onTimeCount / tasksWithDueDate.length) * 100);
    
    if (this.currentUser?.role === 'Manager') {
      this.deadlineAdherence = adherence;
    } else {
      this.memberDeadlineAdherence = adherence;
    }
  }
  
  exportCSV(): void {
    let csvContent = "data:text/csv;charset=utf-8,\n";
    csvContent += `Report Generated On:,${new Date().toLocaleString()}\n\n`;
    
    const total = this.tasks.length;
    const done = this.tasks.filter(t => t.status === 'Done').length;
    const pending = total - done;
    const efficiency = total ? Math.round((done / total) * 100) : 0;
    
    csvContent += `Total Tasks:,${total}\n`;
    csvContent += `Completed Tasks:,${done}\n`;
    csvContent += `Pending Tasks:,${pending}\n`;
    csvContent += `Efficiency (%):,${efficiency}\n\n`;
    
    if (this.currentUser?.role === 'Manager' && this.productivityData) {
      csvContent += "Project Productivity Metrics\n";
      csvContent += "Total Tasks,Done,Pending,Efficiency (%)\n";
      csvContent += `${this.productivityData.total},${this.productivityData.done},${this.productivityData.pending},${this.productivityData.efficiency}\n\n`;
    }
    
    csvContent += "ID,Title,Status,Project,Assigned To,Due Date,Description\n";
    this.tasks.forEach(task => {
      csvContent += `"${task.id}","${task.title}","${task.status}","${task.project || ''}","${task.assignedTo || ''}","${task.dueDate || ''}","${task.description || ''}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tasks_report.csv");
    document.body.appendChild(link);
    link.click();
  }
  
  exportPDF(): void {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("Tasks Report", 10, 10);
    doc.setFontSize(10);
    doc.text("Report Generated On: " + new Date().toLocaleString(), 10, 20);
    
    const total = this.tasks.length;
    const done = this.tasks.filter(t => t.status === 'Done').length;
    const pending = total - done;
    const efficiency = total ? Math.round((done / total) * 100) : 0;
    
    doc.text(`Total Tasks: ${total}`, 10, 30);
    doc.text(`Completed Tasks: ${done}`, 10, 40);
    doc.text(`Pending Tasks: ${pending}`, 10, 50);
    doc.text(`Efficiency (%): ${efficiency}`, 10, 60);
    
    let yPos = 70;
    
    if (this.currentUser?.role === 'Manager' && this.productivityData) {
      doc.text("Team Productivity Metrics:", 10, yPos);
      yPos += 10;
      doc.text(
        `Total Tasks: ${this.productivityData.total} | Done: ${this.productivityData.done} | Pending: ${this.productivityData.pending} | Efficiency: ${this.productivityData.efficiency}%`,
        10,
        yPos
      );
      yPos += 10;
    }
    
    yPos += 10;
    doc.text("Task Details:", 10, yPos);
    yPos += 10;
    this.tasks.forEach(task => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      const line = `${task.id} - ${task.title} (${task.status}) | Project: ${task.project || ''} | Assigned To: ${task.assignedTo || ''} | Due: ${task.dueDate || ''} | Desc: ${task.description || ''}`;
      doc.text(line, 10, yPos);
      yPos += 10;
    });
    
    const pdfBlob = doc.output("blob");
    saveAs(pdfBlob, "tasks_report.pdf");
  }
  
}
