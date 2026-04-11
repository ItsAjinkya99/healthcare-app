import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";

interface Patient {
  name: string;
  email: string;
  age: number;
  gender: string;
}

@Injectable({ providedIn: 'root' })
export class PatientService {
    private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}

  getPatients():Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/patients`, { withCredentials: true });
  }

  createPatient(patientData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/patients`, patientData, { withCredentials: true });
  }
}