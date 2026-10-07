<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { rentalService } from '@/services/rental'
import propertyService from '@/services/property'
import type { RentalAsaasAccount, RentalCharge, RentalContract, RentalDashboard, RentalParty, RentalPayout } from '@/types/rental'
import type { PropertySummaryResponse } from '@/types/property'

type Tab = 'dashboard'|'contracts'|'parties'|'charges'|'payouts'|'settings'
const tab=ref<Tab>('dashboard'), loading=ref(true), busy=ref(false), error=ref(''), success=ref('')
const dashboard=ref<RentalDashboard|null>(null), contracts=ref<RentalContract[]>([]), parties=ref<RentalParty[]>([]), charges=ref<RentalCharge[]>([]), payouts=ref<RentalPayout[]>([]), properties=ref<PropertySummaryResponse[]>([]), account=ref<RentalAsaasAccount|null>(null)
const showParty=ref(false), showContract=ref(false), showCharge=ref(false)
const partyForm=reactive({type:'INDIVIDUAL',name:'',cpfCnpj:'',email:'',phone:'',address:'',pixKey:'',pixKeyType:'CPF'})
const contractForm=reactive({propertyId:'',sourceLeadId:'',startDate:'',endDate:'',dueDay:10,chargeLeadDays:10,payoutDay:15,billingType:'BOLETO',baseRent:0,condoAmount:0,iptuAmount:0,insuranceAmount:0,discountAmount:0,managementFeeType:'PERCENTAGE',managementFeeValue:10,lateFeePercent:2,monthlyInterestPercent:1,guaranteeType:'NONE',guaranteeDetails:'',adjustmentIndex:'MANUAL',nextAdjustmentDate:'',ownerId:'',tenantId:''})
const chargeForm=reactive({contractId:'',competence:new Date().toISOString().slice(0,7)+'-01',dueDate:''})
const asaasForm=reactive({name:'',email:'',cpfCnpj:'',mobilePhone:'',address:'',addressNumber:'',province:'',postalCode:'',rinoFeePercent:1})
const money=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'})
const activeContracts=computed(()=>contracts.value.filter(c=>c.status==='ACTIVE'))
const tabs:Array<{id:Tab;label:string}>=[{id:'dashboard',label:'Visão geral'},{id:'contracts',label:'Contratos'},{id:'parties',label:'Pessoas'},{id:'charges',label:'Cobranças'},{id:'payouts',label:'Repasses'},{id:'settings',label:'Asaas'}]

async function load(){ loading.value=true;error.value='';try{const [d,c,p,ch,po,pr,a]=await Promise.all([rentalService.dashboard(),rentalService.contracts(),rentalService.parties(),rentalService.charges(),rentalService.payouts(),propertyService.list({operation:'RENT',size:100}),rentalService.asaasAccount()]);dashboard.value=d;contracts.value=c;parties.value=p;charges.value=ch;payouts.value=po;properties.value=pr.content;account.value=a}catch(e:any){error.value=e.message||'Não foi possível carregar o módulo'}finally{loading.value=false}}
function flash(message:string){success.value=message;setTimeout(()=>success.value='',3500)}
async function createParty(){busy.value=true;error.value='';try{await rentalService.createParty(partyForm as any);showParty.value=false;Object.assign(partyForm,{type:'INDIVIDUAL',name:'',cpfCnpj:'',email:'',phone:'',address:'',pixKey:'',pixKeyType:'CPF'});await load();tab.value='parties';flash('Pessoa cadastrada.')}catch(e:any){error.value=e.message}finally{busy.value=false}}
async function createContract(){busy.value=true;error.value='';try{await rentalService.createContract({...contractForm,sourceLeadId:contractForm.sourceLeadId||null,nextAdjustmentDate:contractForm.nextAdjustmentDate||null,parties:[{partyId:contractForm.ownerId,role:'OWNER',ownershipPercent:100,billingResponsible:false},{partyId:contractForm.tenantId,role:'TENANT',ownershipPercent:null,billingResponsible:true}]} as any);showContract.value=false;await load();tab.value='contracts';flash('Contrato criado como rascunho.')}catch(e:any){error.value=e.message}finally{busy.value=false}}
async function contractAction(id:string,action:'activate'|'terminate'){busy.value=true;try{action==='activate'?await rentalService.activate(id):await rentalService.terminate(id);await load();flash(action==='activate'?'Contrato ativado.':'Contrato encerrado.')}catch(e:any){error.value=e.message}finally{busy.value=false}}
async function adjustContract(c:RentalContract){const value=prompt('Novo valor do aluguel',String(c.baseRent));if(!value)return;const date=prompt('Data do próximo reajuste (AAAA-MM-DD)',c.nextAdjustmentDate||'');if(!date)return;busy.value=true;try{await rentalService.adjust(c.id,{newBaseRent:Number(value),nextAdjustmentDate:date});await load();flash('Reajuste aplicado às próximas competências.')}catch(e:any){error.value=e.message}finally{busy.value=false}}
function uploadDocument(c:RentalContract){
    const input=document.createElement('input')
    input.type='file'
    input.accept='application/pdf'
    input.onchange=async()=>{
        const file=input.files?.[0]
        if(!file)return
        busy.value=true
        try{await rentalService.uploadDocument(c.id,file);await load();flash('Documento anexado ao contrato.')}
        catch(e:any){error.value=e.message}
        finally{busy.value=false}
    }
    input.click()
}
async function generateCharge(){busy.value=true;try{await rentalService.generateCharge(chargeForm.contractId,{competence:chargeForm.competence,dueDate:chargeForm.dueDate,additionalItems:[]});showCharge.value=false;await load();tab.value='charges';flash('Cobrança gerada para conferência.')}catch(e:any){error.value=e.message}finally{busy.value=false}}
async function issueCharge(id:string){busy.value=true;try{await rentalService.issueCharge(id);await load();flash('Cobrança enviada ao Asaas.')}catch(e:any){error.value=e.message}finally{busy.value=false}}
async function approvePayout(id:string){if(!confirm('Confirma o envio deste Pix ao proprietário?'))return;busy.value=true;try{await rentalService.approvePayout(id);await load();flash('Repasse enviado para processamento.')}catch(e:any){error.value=e.message}finally{busy.value=false}}
async function provision(){if(!confirm('Confirma a criação da subconta Asaas desta imobiliária?'))return;busy.value=true;try{account.value=await rentalService.provisionAsaas(asaasForm);flash('Subconta criada; acompanhe a aprovação cadastral.')}catch(e:any){error.value=e.message}finally{busy.value=false}}
function badge(status:string){return status==='ACTIVE'||status==='RECEIVED'||status==='PAID'?'bg-emerald-100 text-emerald-700':status==='OVERDUE'||status==='ERROR'||status==='FAILED'||status==='REJECTED'?'bg-red-100 text-red-700':status==='DRAFT'?'bg-slate-100 text-slate-600':'bg-amber-100 text-amber-700'}
onMounted(load)
</script>

<template>
  <div class="p-6 lg:p-8 space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div><p class="text-xs font-bold uppercase tracking-[.2em] text-blue-600">Gestão locatícia</p><h1 class="text-3xl font-bold text-slate-900 dark:text-white">Aluguéis</h1><p class="text-sm text-slate-500 mt-1">Contratos, cobranças, conciliação e repasses em um só lugar.</p></div>
      <button @click="load" class="rounded-xl border px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-800">Atualizar</button>
    </div>
    <div v-if="error" class="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{{ error }}</div>
    <div v-if="success" class="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">{{ success }}</div>
    <div class="flex gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-700">
      <button v-for="item in tabs" :key="item.id" @click="tab=item.id" class="px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2" :class="tab===item.id?'border-blue-600 text-blue-600':'border-transparent text-slate-500'">{{ item.label }}</button>
    </div>
    <div v-if="loading" class="py-20 text-center text-slate-500">Carregando gestão de aluguéis...</div>

    <template v-else>
      <section v-if="tab==='dashboard'" class="space-y-6">
        <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div class="card"><span>Contratos ativos</span><strong>{{ dashboard?.activeContracts ?? 0 }}</strong></div>
          <div class="card"><span>Cobranças vencidas</span><strong class="text-red-600">{{ dashboard?.overdueCharges ?? 0 }}</strong></div>
          <div class="card"><span>Repasses pendentes</span><strong class="text-amber-600">{{ dashboard?.pendingPayouts ?? 0 }}</strong></div>
          <div class="card"><span>Recebido no mês</span><strong>{{ money.format(dashboard?.receivedThisMonth ?? 0) }}</strong></div>
        </div>
        <div class="panel"><h2 class="section-title">Próximas ações</h2><div class="grid md:grid-cols-3 gap-3 mt-4"><button @click="showContract=true" class="action">Novo contrato</button><button @click="showCharge=true" class="action">Gerar cobrança</button><button @click="tab='payouts'" class="action">Revisar repasses</button></div></div>
      </section>

      <section v-if="tab==='contracts'" class="panel">
        <div class="section-head"><div><h2 class="section-title">Contratos</h2><p class="hint">A ativação bloqueia outra locação ativa e retira o imóvel da vitrine.</p></div><button @click="showContract=true" class="primary">Novo contrato</button></div>
        <div class="table-wrap"><table><thead><tr><th>Imóvel</th><th>Vigência</th><th>Aluguel</th><th>Status</th><th class="text-right">Ações</th></tr></thead><tbody><tr v-for="c in contracts" :key="c.id"><td>{{ properties.find(p=>p.id===c.propertyId)?.title || c.propertyId }}</td><td>{{ c.startDate }} a {{ c.endDate }}</td><td>{{ money.format(c.baseRent) }}</td><td><span :class="['badge',badge(c.status)]">{{ c.status }}</span></td><td class="text-right space-x-2"><button v-if="c.status==='DRAFT'" @click="contractAction(c.id,'activate')" class="link">Ativar</button><button @click="uploadDocument(c)" class="link">Anexar PDF</button><a v-if="c.documents?.length" :href="c.documents[0].url" target="_blank" class="link">Documento</a><button v-if="c.status==='ACTIVE'" @click="adjustContract(c)" class="link">Reajustar</button><button v-if="c.status==='ACTIVE'" @click="contractAction(c.id,'terminate')" class="link text-red-600">Encerrar</button></td></tr><tr v-if="!contracts.length"><td colspan="5" class="empty">Nenhum contrato cadastrado.</td></tr></tbody></table></div>
      </section>

      <section v-if="tab==='parties'" class="panel">
        <div class="section-head"><div><h2 class="section-title">Pessoas</h2><p class="hint">Proprietários, locatários e fiadores podem participar de mais de um contrato.</p></div><button @click="showParty=true" class="primary">Nova pessoa</button></div>
        <div class="table-wrap"><table><thead><tr><th>Nome</th><th>Documento</th><th>Contato</th><th>Pix</th></tr></thead><tbody><tr v-for="p in parties" :key="p.id"><td class="font-semibold">{{ p.name }}<small>{{ p.type==='INDIVIDUAL'?'Pessoa física':'Pessoa jurídica' }}</small></td><td>{{ p.cpfCnpj||'—' }}</td><td>{{ p.email||p.phone||'—' }}</td><td>{{ p.pixKeyMasked||'Não cadastrado' }}</td></tr><tr v-if="!parties.length"><td colspan="4" class="empty">Nenhuma pessoa cadastrada.</td></tr></tbody></table></div>
      </section>

      <section v-if="tab==='charges'" class="panel">
        <div class="section-head"><div><h2 class="section-title">Cobranças</h2><p class="hint">Cada competência é congelada antes do envio ao Asaas.</p></div><button @click="showCharge=true" class="primary">Gerar cobrança</button></div>
        <div class="table-wrap"><table><thead><tr><th>Competência</th><th>Vencimento</th><th>Total</th><th>Fee Rino</th><th>Status</th><th class="text-right">Ações</th></tr></thead><tbody><tr v-for="c in charges" :key="c.id"><td>{{ c.competence }}</td><td>{{ c.dueDate }}</td><td>{{ money.format(c.totalAmount) }}</td><td>{{ money.format(c.rinoFeeAmount) }}</td><td><span :class="['badge',badge(c.status)]">{{ c.status }}</span><small v-if="c.errorMessage" class="text-red-600">{{ c.errorMessage }}</small></td><td class="text-right space-x-2"><button v-if="c.status==='DRAFT'||c.status==='ERROR'" @click="issueCharge(c.id)" class="link">Emitir</button><a v-if="c.invoiceUrl" :href="c.invoiceUrl" target="_blank" class="link">Fatura</a><a v-if="c.receiptUrl" :href="c.receiptUrl" target="_blank" class="link">Recibo</a></td></tr><tr v-if="!charges.length"><td colspan="6" class="empty">Nenhuma cobrança gerada.</td></tr></tbody></table></div>
      </section>

      <section v-if="tab==='payouts'" class="panel">
        <div class="section-head"><div><h2 class="section-title">Repasses</h2><p class="hint">O Pix só é enviado depois da conferência e confirmação de um usuário autorizado.</p></div></div>
        <div class="table-wrap"><table><thead><tr><th>Proprietário</th><th>Bruto</th><th>Taxa imobiliária</th><th>Líquido</th><th>Status</th><th class="text-right">Ações</th></tr></thead><tbody><tr v-for="p in payouts" :key="p.id"><td>{{ p.ownerName }}</td><td>{{ money.format(p.grossOwnerAmount) }}</td><td>{{ money.format(p.managementFeeAmount) }}</td><td class="font-bold">{{ money.format(p.netAmount) }}</td><td><span :class="['badge',badge(p.status)]">{{ p.status }}</span></td><td class="text-right"><button v-if="['DRAFT','READY','FAILED'].includes(p.status)" @click="approvePayout(p.id)" class="link">Conferir e enviar Pix</button></td></tr><tr v-if="!payouts.length"><td colspan="6" class="empty">Nenhum repasse pendente.</td></tr></tbody></table></div>
      </section>

      <section v-if="tab==='settings'" class="panel max-w-4xl">
        <div class="section-head"><div><h2 class="section-title">Conta Asaas da imobiliária</h2><p class="hint">Subconta isolada para cobranças e repasses de aluguel. O billing do plano Rinoimob permanece separado.</p></div><span :class="['badge',badge(account?.status||'NOT_CONFIGURED')]">{{ account?.status||'NOT_CONFIGURED' }}</span></div>
        <div v-if="account?.configured" class="mt-5 grid sm:grid-cols-3 gap-4"><div class="metric"><span>Conta</span><b>{{ account.providerAccountId }}</b></div><div class="metric"><span>Carteira</span><b>{{ account.walletId }}</b></div><div class="metric"><span>Fee Rino</span><b>{{ account.rinoFeePercent }}%</b></div></div>
        <form v-else @submit.prevent="provision" class="form-grid mt-6"><label>Razão social<input v-model="asaasForm.name" required></label><label>E-mail<input v-model="asaasForm.email" type="email" required></label><label>CNPJ<input v-model="asaasForm.cpfCnpj" required></label><label>Telefone<input v-model="asaasForm.mobilePhone" required></label><label class="sm:col-span-2">Endereço<input v-model="asaasForm.address" required></label><label>Número<input v-model="asaasForm.addressNumber" required></label><label>Bairro<input v-model="asaasForm.province" required></label><label>CEP<input v-model="asaasForm.postalCode" required></label><label>Fee Rino (%)<input v-model.number="asaasForm.rinoFeePercent" type="number" min="0" step="0.01" required></label><div class="sm:col-span-2"><button :disabled="busy" class="primary">Provisionar subconta</button></div></form>
      </section>
    </template>

    <div v-if="showParty" class="modal"><form @submit.prevent="createParty" class="dialog"><div class="section-head"><h2 class="section-title">Nova pessoa</h2><button type="button" @click="showParty=false">✕</button></div><div class="form-grid"><label>Tipo<select v-model="partyForm.type"><option value="INDIVIDUAL">Pessoa física</option><option value="LEGAL_ENTITY">Pessoa jurídica</option></select></label><label>Nome<input v-model="partyForm.name" required></label><label>CPF/CNPJ<input v-model="partyForm.cpfCnpj"></label><label>E-mail<input v-model="partyForm.email" type="email"></label><label>Telefone<input v-model="partyForm.phone"></label><label>Chave Pix<input v-model="partyForm.pixKey"></label><label>Tipo da chave<select v-model="partyForm.pixKeyType"><option>CPF</option><option>CNPJ</option><option>EMAIL</option><option>PHONE</option><option>EVP</option></select></label><label class="sm:col-span-2">Endereço<input v-model="partyForm.address"></label></div><div class="dialog-actions"><button type="button" @click="showParty=false">Cancelar</button><button :disabled="busy" class="primary">Salvar</button></div></form></div>

    <div v-if="showContract" class="modal"><form @submit.prevent="createContract" class="dialog max-w-4xl"><div class="section-head"><h2 class="section-title">Novo contrato</h2><button type="button" @click="showContract=false">✕</button></div><div class="form-grid"><label class="sm:col-span-2">Imóvel<select v-model="contractForm.propertyId" required><option value="">Selecione</option><option v-for="p in properties" :key="p.id" :value="p.id">{{ p.title }} · {{ p.referenceCode }}</option></select></label><label>Proprietário<select v-model="contractForm.ownerId" required><option value="">Selecione</option><option v-for="p in parties" :key="p.id" :value="p.id">{{ p.name }}</option></select></label><label>Locatário responsável<select v-model="contractForm.tenantId" required><option value="">Selecione</option><option v-for="p in parties" :key="p.id" :value="p.id">{{ p.name }}</option></select></label><label>Início<input v-model="contractForm.startDate" type="date" required></label><label>Término<input v-model="contractForm.endDate" type="date" required></label><label>Aluguel<input v-model.number="contractForm.baseRent" type="number" min="0.01" step="0.01" required></label><label>Condomínio<input v-model.number="contractForm.condoAmount" type="number" min="0" step="0.01"></label><label>IPTU<input v-model.number="contractForm.iptuAmount" type="number" min="0" step="0.01"></label><label>Seguro<input v-model.number="contractForm.insuranceAmount" type="number" min="0" step="0.01"></label><label>Dia do vencimento<input v-model.number="contractForm.dueDay" type="number" min="1" max="28"></label><label>Dia do repasse<input v-model.number="contractForm.payoutDay" type="number" min="1" max="28"></label><label>Forma de cobrança<select v-model="contractForm.billingType"><option>BOLETO</option><option>PIX</option></select></label><label>Taxa imobiliária (%)<input v-model.number="contractForm.managementFeeValue" type="number" min="0" step="0.01"></label><label>Garantia<select v-model="contractForm.guaranteeType"><option value="NONE">Sem garantia</option><option value="DEPOSIT">Caução</option><option value="GUARANTOR">Fiador</option><option value="INSURANCE">Seguro-fiança</option><option value="CAPITALIZATION_BOND">Título de capitalização</option></select></label><label>Próximo reajuste<input v-model="contractForm.nextAdjustmentDate" type="date"></label></div><div class="dialog-actions"><button type="button" @click="showContract=false">Cancelar</button><button :disabled="busy" class="primary">Salvar rascunho</button></div></form></div>

    <div v-if="showCharge" class="modal"><form @submit.prevent="generateCharge" class="dialog"><div class="section-head"><h2 class="section-title">Gerar cobrança</h2><button type="button" @click="showCharge=false">✕</button></div><div class="form-grid"><label class="sm:col-span-2">Contrato<select v-model="chargeForm.contractId" required><option value="">Selecione</option><option v-for="c in activeContracts" :key="c.id" :value="c.id">{{ properties.find(p=>p.id===c.propertyId)?.title }} · {{ money.format(c.baseRent) }}</option></select></label><label>Competência<input v-model="chargeForm.competence" type="date" required></label><label>Vencimento<input v-model="chargeForm.dueDate" type="date" required></label></div><div class="dialog-actions"><button type="button" @click="showCharge=false">Cancelar</button><button :disabled="busy" class="primary">Gerar rascunho</button></div></form></div>
  </div>
</template>

<style scoped>
.panel{ @apply rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800; }.card{ @apply panel flex flex-col gap-2; }.card span,.metric span{ @apply text-xs font-bold uppercase tracking-wider text-slate-400; }.card strong{ @apply text-3xl text-slate-900 dark:text-white; }.section-head{ @apply flex flex-wrap items-start justify-between gap-4; }.section-title{ @apply text-lg font-bold text-slate-900 dark:text-white; }.hint{ @apply mt-1 text-sm text-slate-500; }.primary{ @apply rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50; }.action{ @apply rounded-xl border border-slate-200 bg-slate-50 p-4 text-left font-semibold hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900; }.table-wrap{ @apply mt-5 overflow-x-auto; }table{ @apply w-full text-sm; }th{ @apply border-b border-slate-200 px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400 dark:border-slate-700; }td{ @apply border-b border-slate-100 px-3 py-4 text-slate-700 dark:border-slate-700 dark:text-slate-200; }td small{ @apply mt-1 block text-xs text-slate-400; }.empty{ @apply py-12 text-center text-slate-400; }.badge{ @apply inline-flex rounded-full px-2.5 py-1 text-xs font-bold; }.link{ @apply text-sm font-bold text-blue-600 hover:underline; }.metric{ @apply rounded-xl bg-slate-50 p-4 dark:bg-slate-900; }.metric b{ @apply mt-2 block break-all text-sm; }.modal{ @apply fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4; }.dialog{ @apply max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800; }.form-grid{ @apply grid gap-4 sm:grid-cols-2; }.form-grid label{ @apply text-sm font-semibold text-slate-600 dark:text-slate-300; }.form-grid input,.form-grid select{ @apply mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white; }.dialog-actions{ @apply mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-700; }
</style>
