import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { Department } from 'src/app/models/department';
import { DepartmentService } from 'src/app/services/department.service';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss']
})
export class DepartmentComponent implements OnInit {
  deptName: string = ''
  departments: Department[] = []
  depEdit?: Department | null
  unsubscribe$: Subject<any> = new Subject()

  constructor(
    private departmentService: DepartmentService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.departmentService.get()
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe({
      next: (dpts) => this.departments = dpts
    })
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(null)
  }

  save(): void {
    if(this.depEdit){
      this.departmentService.update({name: this.deptName, _id: this.depEdit._id})
      .subscribe({
        next: (dpt) => {
          this.notify('Updated!')
          this.clearFields()
        },
        error: (err) => {
          this.notify('Error!')
          console.log(err)
        }
      })
    }
    else{
      this.departmentService.add({name: this.deptName}).subscribe({
        next: (dpt) => {
          console.log(dpt)
          this.clearFields()
          this.notify('Inserted!')
        },
        error: (err) => console.error(err)
      })
    }
    this.clearFields()
  }

  clearFields(): void {
    this.deptName = ''
    this.depEdit = null
  }

  cancel(): void {

  }

  delete(dpt: Department): void {
    this.departmentService.del(dpt)
    .subscribe({
      next: () => this.notify('Removed!'),
      error: (err) => {
        this.notify(err.error.msg)
      }
    })
  }

  edit(dpt: Department): void {
    this.deptName = dpt.name
    this.depEdit = dpt
  }

  notify(msg: string): void {
    this.snackBar.open(msg, 'OK', {duration: 2000})
  }

}
