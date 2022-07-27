import { Pipe, PipeTransform } from "@angular/core";
import { Department } from "./models/department";

@Pipe({name: 'departmentToString'})
export class DepartmentToString implements PipeTransform {
  transform(value: any): string[] {
    const result = value.map((value: Department) => value.name.toString())
    return result
  }
}