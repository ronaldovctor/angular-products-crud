import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { Department } from 'src/app/models/department';
import { Product } from 'src/app/models/product';
import { DepartmentService } from 'src/app/services/department.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
  productForm: FormGroup = this.fb.group({
    _id: [null],
    name: ['', [Validators.required]],
    stock: [0, [Validators.required, Validators.min(0)]],
    price: [0, [Validators.required, Validators.min(1)]],
    departments: [[], [Validators.required]]
  })

  @ViewChild('form') form?: NgForm

  products: Product[] = []
  departments: Department[] = []

  private unsubAll$: Subject<any> = new Subject()

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private snackbar: MatSnackBar
    ) { }

  ngOnInit(): void {
    this.productService.get()
    .pipe(
      takeUntil(this.unsubAll$)
    )
    .subscribe((prods) => this.products = prods)
    this.departmentService.get()
    .pipe(
      takeUntil(this.unsubAll$)
    )
    .subscribe((dpts) => this.departments = dpts)
  }

  ngOnDestroy(): void {
    this.unsubAll$.next(null)
  }

  save(): void {
    let data = this.productForm.value
    if(data._id != null){
      this.productService.update(data)
      .subscribe(
        (p) => this.notify("Updated!")
      )
    }else{
      this.productService.add(data).subscribe(
        (p) => this.notify('Inserted!')
      )
    }
  }

  delete(p: Product): void {
    this.productService.del(p)
    .subscribe({
      next: () => this.notify('Deleted!'),
      error: (err) => console.log(err)
    })
  }

  edit(p: Product): void {
    this.productForm.setValue(p)
  }

  notify(msg: string) {
    this.snackbar.open(msg, 'OK', {duration: 2000})
  }

  resetForm(): void {
    //this.productForm.reset();
    this.form?.resetForm()
  }
}
