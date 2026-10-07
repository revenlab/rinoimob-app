import { apiFetch, API_BASE } from '@/lib/api'
import type { RentalParty,RentalPartyInput,RentalContract,RentalContractInput,RentalCharge,RentalPayout,RentalDashboard,RentalAsaasAccount } from '@/types/rental'
const BASE=`${API_BASE}/rentals`
export const rentalService={
  parties:()=>apiFetch<RentalParty[]>(`${BASE}/parties`),
  createParty:(data:RentalPartyInput)=>apiFetch<RentalParty>(`${BASE}/parties`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}),
  contracts:()=>apiFetch<RentalContract[]>(`${BASE}/contracts`),
  contract:(id:string)=>apiFetch<RentalContract>(`${BASE}/contracts/${id}`),
  createContract:(data:RentalContractInput)=>apiFetch<RentalContract>(`${BASE}/contracts`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}),
  activate:(id:string)=>apiFetch<RentalContract>(`${BASE}/contracts/${id}/activate`,{method:'POST'}),
  terminate:(id:string)=>apiFetch<RentalContract>(`${BASE}/contracts/${id}/terminate`,{method:'POST'}),
  adjust:(id:string,data:{newBaseRent:number;nextAdjustmentDate:string})=>apiFetch<RentalContract>(`${BASE}/contracts/${id}/adjustment`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}),
  uploadDocument:(id:string,file:File,name='Contrato assinado')=>{
    const body=new FormData()
    body.append('file',file)
    body.append('name',name)
    return apiFetch<{id:string;name:string;url:string;createdAt:string}>(`${BASE}/contracts/${id}/documents`,{method:'POST',body})
  },
  dashboard:()=>apiFetch<RentalDashboard>(`${BASE}/dashboard`),
  charges:()=>apiFetch<RentalCharge[]>(`${BASE}/charges`),
  generateCharge:(contractId:string,data:{competence:string;dueDate:string;additionalItems:unknown[]})=>apiFetch<RentalCharge>(`${BASE}/contracts/${contractId}/charges`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}),
  issueCharge:(id:string)=>apiFetch<RentalCharge>(`${BASE}/charges/${id}/issue`,{method:'POST'}),
  payouts:()=>apiFetch<RentalPayout[]>(`${BASE}/payouts`),
  approvePayout:(id:string)=>apiFetch<RentalPayout>(`${BASE}/payouts/${id}/approve`,{method:'POST'}),
  asaasAccount:()=>apiFetch<RentalAsaasAccount>(`${BASE}/asaas-account`),
  provisionAsaas:(data:Record<string,unknown>)=>apiFetch<RentalAsaasAccount>(`${BASE}/asaas-account/provision`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}),
}
