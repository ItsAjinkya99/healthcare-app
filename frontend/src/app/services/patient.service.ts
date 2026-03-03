import { HttpClient } from "@angular/common/http";

export class PatientService {
  constructor(private http: HttpClient) {}

  getPatients() {
    return this.http.get<any[]>('/api/patients');
  }
}