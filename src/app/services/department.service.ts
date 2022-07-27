import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, Observable, tap } from 'rxjs';
import { Department } from '../models/department';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  readonly url = 'http://localhost:9000/departments'
  private departmentSubject$: BehaviorSubject<Department[]> = new BehaviorSubject<Department[]>([])
  private loaded: boolean = false

  constructor(private http: HttpClient) { }

  get(): Observable<Department[]>{
    if(!this.loaded){
      this.http.get<Department[]>(this.url)
      .pipe(
        tap((dpts) => console.log(dpts)),
        //delay(1000)
      )
      .subscribe(this.departmentSubject$)
    }
    return this.departmentSubject$.asObservable()
  }

  add(dpt: Department): Observable<Department> {
    return this.http.post<Department>(this.url, dpt)
    .pipe(tap((dpt: Department) => this.departmentSubject$.getValue().push(dpt)))
  }

  del(dpt: Department): Observable<any>{
    return this.http.delete(`${this.url}/${dpt._id}`)
    .pipe(tap(() => {
      let dpts = this.departmentSubject$.getValue()
      let index = dpts.findIndex(d => d._id = dpt._id)
      if(index >= 0)
        dpts.splice(index, 1)
    }))
  }

  update(dpt: Department): Observable<Department> {
    return this.http.patch<Department>(`${this.url}/${dpt._id}`, dpt)
    .pipe(
      tap((dpt) => {
        let dpts = this.departmentSubject$.getValue()
        let index = dpts.findIndex(d => d._id = dpt._id)
        if(index >= 0)
          dpts[index].name = dpt.name
      })
    )
  }
}
