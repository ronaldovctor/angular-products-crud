import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, filter, map, Observable, tap } from 'rxjs';
import { Product } from '../models/product';
import { Department } from '../models/department'
import { DepartmentService } from './department.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  readonly url = 'http://localhost:9000/products'
  private productsSubject$: BehaviorSubject<Product[]> = new BehaviorSubject<Product[]>([])
  private loaded: boolean = false

  constructor(private http: HttpClient, private departmentService: DepartmentService) { }

  get(): Observable<Product[]>{
    if(!this.loaded){
      combineLatest([
        this.http.get<Product[]>(this.url),
        this.departmentService.get()
      ]).pipe(
        filter(([products, departments])=> products != null && departments != null),
        map(([prods, dpts]) => {
          if(!prods) return []
          prods.forEach((value) => {
            let ids: string[] = (value.departments as string[])
            value.departments = ids.map<Department>((id) => dpts.find(dpt => dpt._id == id) as Department)
          })
          return prods
        }),
        tap((prods) => console.log(prods))
      )
      .subscribe(this.productsSubject$)
      this.loaded = true
    }
    return this.productsSubject$.asObservable()
  }

  add(prod: Product): Observable<Product> {
    let dpts = (prod.departments as Department[]).map(d => d._id)
    console.log({...prod, departments: dpts})
    return this.http.post<Product>(this.url, {...prod, departments: dpts})
    .pipe(
      tap((prod) => {
        console.log(prod)
        this.productsSubject$.getValue().push({...prod, _id: prod._id})
      })
    )
  }

  del(prod: Product): Observable<Product> {
    return this.http.delete<Product>(`${this.url}/${prod._id}`)
    .pipe(
      tap(() => {
        let prods = this.productsSubject$.getValue()
        let index = prods.findIndex((p) => p._id == prod._id)
        if(index >= 0)
          prods.splice(index, 1)
      }) 
    )
  }

  update(prod: Product): Observable<Product> {
    let dpts = (prod.departments as Department[]).map(d => d._id)
    return this.http.patch<Product>(`${this.url}/${prod._id}`, {...prod, departments: dpts})
    .pipe(
      tap((product) => {
        let prods = this.productsSubject$.getValue()
        let index = prods.findIndex((p) => p._id == prod._id)
        if(index >= 0)
          prods[index] = product
      }) 
    )
  }

}
