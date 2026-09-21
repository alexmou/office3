#!/usr/bin/env python3
import os, json, csv, argparse, datetime, urllib.request, urllib.error, urllib.parse

class Grist:
    def __init__(self, host, doc, key, dry=False):
        self.host=host.rstrip('/'); self.doc=doc; self.key=key; self.dry=dry
    def req(self, method, path, body=None, query=None):
        if query: path += '?' + urllib.parse.urlencode(query)
        url=self.host+path
        if self.dry and method != 'GET':
            print('DRY',method,url,json.dumps(body,ensure_ascii=False)[:1200]); return {}
        data=None if body is None else json.dumps(body,ensure_ascii=False).encode()
        req=urllib.request.Request(url,data=data,method=method,headers={'Authorization':'Bearer '+self.key,'Content-Type':'application/json','Accept':'application/json','User-Agent':'Mozilla/5.0 (Linux; U; Linux x86_64; en-US) AppleWebKit/537.36'})
        try:
            with urllib.request.urlopen(req,timeout=60) as r:
                raw=r.read().decode(); return json.loads(raw) if raw else {}
        except urllib.error.HTTPError as e:
            raise RuntimeError(f'{method} {url} -> HTTP {e.code}: {e.read().decode("utf-8","replace")}')
    def tables(self): return self.req('GET',f'/api/docs/{self.doc}/tables',query={'expand':'column'}).get('tables',[])
    def columns(self,t): return self.req('GET',f'/api/docs/{self.doc}/tables/{t}/columns',query={'hidden':'true'}).get('columns',[])
    def create_table(self,t,cols): return self.req('POST',f'/api/docs/{self.doc}/tables',{'tables':[{'id':t,'columns':cols}]})
    def put_columns(self,t,cols): return self.req('PUT',f'/api/docs/{self.doc}/tables/{t}/columns',{'columns':cols})
    def upsert(self,t,recs,batch=200):
        for i in range(0,len(recs),batch):
            self.req('PUT',f'/api/docs/{self.doc}/tables/{t}/records',{'records':recs[i:i+batch]},query={'onmany':'first'})

def col(cid, typ='Text', label=None, formula=None, choices=None):
    fields={'type':typ}
    if label: fields['label']=label
    if formula is not None: fields.update({'formula':formula,'isFormula':True})
    if choices: fields['widgetOptions']=json.dumps({'choices':choices},ensure_ascii=False)
    return {'id':cid,'fields':fields}

def pick(cols, aliases, required=True):
    ids={c['id'] for c in cols}; low={x.casefold():x for x in ids}
    for a in aliases:
        if a in ids: return a
        if a.casefold() in low: return low[a.casefold()]
    if required: raise RuntimeError('В Sales не найден столбец: '+ ' / '.join(aliases)+'. Доступны: '+', '.join(sorted(ids)))
    return None

def ensure_table(g,t,cols):
    existing={x['id'] for x in g.tables()}
    if t not in existing:
        print('CREATE',t); g.create_table(t,cols); return
    have={x['id'] for x in g.columns(t)}; missing=[x for x in cols if x['id'] not in have]
    if missing:
        print('ADD',t,[x['id'] for x in missing]); g.put_columns(t,missing)
    else: print('OK',t)

def month_formula(date_col):
    return f"import datetime\nif not ${date_col}: return None\nreturn datetime.date(${date_col}.year, ${date_col}.month, 1)"

def add_imports(formula):
    imports=[]
    if 'datetime.' in formula: imports.append('import datetime')
    if 'calendar.' in formula: imports.append('import calendar')
    if imports: return '\n'.join(imports)+'\n'+formula
    return formula

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--host',default=os.getenv('GRIST_HOST','http://127.0.0.1:8484'))
    ap.add_argument('--doc',default=os.getenv('GRIST_DOC_ID'))
    ap.add_argument('--api-key',default=os.getenv('GRIST_API_KEY'))
    ap.add_argument('--data-dir',default=os.path.dirname(os.path.abspath(__file__)))
    ap.add_argument('--months-ahead',type=int,default=18)
    ap.add_argument('--dry-run',action='store_true')
    a=ap.parse_args()
    if not a.doc or not a.api_key: ap.error('Укажите GRIST_DOC_ID и GRIST_API_KEY')
    g=Grist(a.host,a.doc,a.api_key,a.dry_run)

    if 'Sales' not in {t['id'] for t in g.tables()}: raise RuntimeError('Не найдена существующая таблица Sales')
    sc=g.columns('Sales')
    sale_date=pick(sc,['date','Date'])
    sale_amount=pick(sc,['finalPriceVND','FinalPriceVND'])
    supplier=pick(sc,['AmountToSupplier','supplierAmount','SupplierAmount'])
    terminal=pick(sc,['Terminal','terminal'])
    done=pick(sc,['done','Done','status','Status'],False)
    if 'BudgetMonth' not in {c['id'] for c in sc}:
        g.put_columns('Sales',[col('BudgetMonth','Date','Budget month',month_formula(sale_date))]); print('ADD Sales.BudgetMonth')

    ensure_table(g,'BudgetCategories',[
        col('Category','Text','Статья'),col('BaseCategory','Text','Базовая статья'),col('Occurrences','Int','Записей в источнике')])

    ensure_table(g,'Budget',[
        col('LegacyRowId','Int','Legacy row'),col('Date','Date','Дата'),col('Time','Text','Время'),
        col('Status','Choice','Вид',choices=['Оплачено','Не оплачено']),col('OperationType','Choice','Тип',choices=['Расход','Приход']),
        col('Amount','Numeric','Сумма'),col('BudgetName','Text','Бюджет'),col('Category','Text','Статья расходов'),
        col('CategoryRef','Ref:BudgetCategories','Статья (ref)','BudgetCategories.lookupOne(Category=$Category)'),
        col('BaseCategory','Text','Базовая статья','$CategoryRef.BaseCategory if $CategoryRef else $Category'),
        col('Year','Int','Год','$Date.year if $Date else None'),col('MonthNo','Int','Месяц','$Date.month if $Date else None'),
        col('MonthKey','Date','Месяц (дата)',month_formula('Date')),col('Comment','Text','Комментарий'),col('Username','Text','username'),
        col('PaymentSource','Choice','PaymentCashRegister',choices=['Бюджет','Касса']),col('LegacyId','Text','Legacy id'),col('CountInBudget','Bool','countInBudget')])

    sales_fact=f"sum((r.{sale_amount} or 0) for r in Sales.lookupRecords(BudgetMonth=$Month))"
    supplier_fact=f"sum((r.{supplier} or 0) for r in Sales.lookupRecords(BudgetMonth=$Month))"
    terminal_fact=f"sum((r.{terminal} or 0) for r in Sales.lookupRecords(BudgetMonth=$Month))"
    supplier_paid=(f"sum((r.{supplier} or 0) for r in Sales.lookupRecords(BudgetMonth=$Month, {done}='done'))" if done else '0')
    last30=f"""today=datetime.date.today()\nstart=today-datetime.timedelta(days=29)\ntotal=0\nfor r in Sales.all:\n  d=r.{sale_date}\n  if not d: continue\n  if hasattr(d,'date'): d=d.date()\n  if start <= d <= today: total += float(r.{sale_amount} or 0)\nreturn total"""
    months=[
        col('Month','Date','Месяц'),col('Year','Int','Год','$Month.year if $Month else None'),col('MonthNo','Int','№ месяца','$Month.month if $Month else None'),
        col('MonthLabel','Text','Месяц',"$Month.strftime('%m.%Y') if $Month else ''"),
        col('Closed','Bool','Закрыт',add_imports("bool($Month and $Month < datetime.date.today().replace(day=1))")),
        col('DaysInMonth','Int','Дней в месяце',add_imports("calendar.monthrange($Month.year,$Month.month)[1] if $Month else 0")),
        col('DaysElapsed','Int','Прошло дней',add_imports("min(datetime.date.today().day,$DaysInMonth) if $Month and $Month.year==datetime.date.today().year and $Month.month==datetime.date.today().month else ($DaysInMonth if $Closed else 0)")),
        col('SalesFact','Numeric','Продажи факт',sales_fact),
        col('SalesForecastTrend','Numeric','Продажи прогноз trend',"""if not $Month or $Closed: return $SalesFact\nprev=sorted([m for m in Months.all if m.Month and m.Month<$Month],key=lambda m:m.Month)[-6:]\nvals=[float(m.SalesFact or 0) for m in prev if (m.SalesFact or 0)>0]\nif not vals: return float($SalesFact or 0)\nlast3=vals[-3:]\navg=sum(last3)/len(last3)\ntrend=(last3[-1]-last3[0])/(len(last3)-1) if len(last3)>1 else 0\nreturn max(float($SalesFact or 0),avg+trend)"""),
        col('SalesExpected','Numeric','Продажи факт/прогноз','$SalesFact if $Closed else max($SalesFact or 0,$SalesForecastTrend or 0)'),
        col('SalesForecastRunRate','Numeric','Прогноз по темпу месяца',add_imports("today=datetime.date.today()\nif not $Month or $Month.year!=today.year or $Month.month!=today.month or not $DaysElapsed: return 0\nreturn float($SalesFact or 0)/$DaysElapsed*$DaysInMonth")),
        col('SalesLast30Days','Numeric','Доход за 30 дней',add_imports(last30)),
        col('RevenueExpected','Numeric','ИТОГО ДОХОД',add_imports("today=datetime.date.today()\nif not $Month: return 0\nif $Month.year==today.year and $Month.month==today.month:\n  return (float($SalesExpected or 0)+float($SalesForecastRunRate or 0)+float($SalesLast30Days or 0))/3.0\nreturn float($SalesExpected or 0)")),
        col('SupplierFact','Numeric','Поставщики факт',supplier_fact),
        col('SupplierForecast','Numeric','Поставщики прогноз',"""if $Closed: return $SupplierFact\nh=sorted([m for m in Months.all if m.Month and m.Month<$Month and (m.SupplierFact or 0)>0],key=lambda m:m.Month)[-3:]\nreturn sum(float(m.SupplierFact) for m in h)/len(h) if h else float($SupplierFact or 0)"""),
        col('SupplierExpected','Numeric','Поставщики факт/прогноз','$SupplierFact if $Closed else max($SupplierFact or 0,$SupplierForecast or 0)'),
        col('SupplierPaid','Numeric','Оплачено поставщикам',supplier_paid),col('SupplierDebt','Numeric','Долг поставщикам','($SupplierExpected or 0)-($SupplierPaid or 0)'),
        col('TerminalFact','Numeric','Терминал факт',terminal_fact),
        col('TerminalForecast','Numeric','Терминал прогноз',"""if $Closed: return $TerminalFact\nh=sorted([m for m in Months.all if m.Month and m.Month<$Month and (m.TerminalFact or 0)>0],key=lambda m:m.Month)[-3:]\nreturn sum(float(m.TerminalFact) for m in h)/len(h) if h else float($TerminalFact or 0)"""),
        col('TerminalExpected','Numeric','Терминал факт/прогноз','$TerminalFact if $Closed else max($TerminalFact or 0,$TerminalForecast or 0)'),
        col('ExpensesPaid','Numeric','Расходы оплачено',"sum((r.Amount or 0) for r in Budget.lookupRecords(MonthKey=$Month,Status='Оплачено',OperationType='Расход',CountInBudget=True))"),
        col('ExpensesPlanned','Numeric','Расходы не оплачено',"sum((r.Amount or 0) for r in Budget.lookupRecords(MonthKey=$Month,Status='Не оплачено',OperationType='Расход',CountInBudget=True))"),
        col('TotalExpenses','Numeric','ИТОГО РАСХОДЫ',"base=float($SupplierExpected or 0)+float($TerminalExpected or 0)+float($ExpensesPaid or 0)\nreturn base if $Closed else base+float($ExpensesPlanned or 0)"),
        col('Profit','Numeric','ИТОГО ДОХОД-РАСХОД','float($RevenueExpected or 0)-float($TotalExpenses or 0)'),
        col('CumulativeProfit','Numeric','Накопительно','sum((m.Profit or 0) for m in Months.all if m.Month and m.Month <= $Month)')]
    ensure_table(g,'Months',months)

    with open(os.path.join(a.data_dir,'BudgetCategories.csv'),encoding='utf-8-sig',newline='') as f: cats=list(csv.DictReader(f))
    g.upsert('BudgetCategories',[{'require':{'Category':r['Category']},'fields':{'BaseCategory':r['BaseCategory'],'Occurrences':int(r['Occurrences'])}} for r in cats]); print('UPSERT categories',len(cats))
    with open(os.path.join(a.data_dir,'Budget.csv'),encoding='utf-8-sig',newline='') as f: br=list(csv.DictReader(f))
    recs=[]
    for r in br:
        recs.append({'require':{'LegacyRowId':int(r['LegacyRowId'])},'fields':{'Date':r['Date'],'Time':r['Time'],'Status':r['Status'],'OperationType':r['OperationType'],'Amount':float(r['Amount'] or 0),'BudgetName':r['BudgetName'],'Category':r['Category'],'Comment':r['Comment'],'Username':r['Username'],'PaymentSource':r['PaymentSource'],'LegacyId':r['LegacyId'],'CountInBudget':r['CountInBudget'].lower() in ('true','1','yes')}})
    g.upsert('Budget',recs); print('UPSERT budget',len(recs))
    start=min(datetime.date.fromisoformat(r['Date']) for r in br if r['Date']).replace(day=1); cur=start; today=datetime.date.today().replace(day=1)
    end_month=today.month-1+a.months_ahead; end=datetime.date(today.year+end_month//12,end_month%12+1,1); dates=[]
    while cur<=end:
        dates.append(cur); cur=datetime.date(cur.year+(cur.month//12),cur.month%12+1,1)
    g.upsert('Months',[{'require':{'Month':d.isoformat()},'fields':{}} for d in dates]); print('UPSERT months',len(dates),start,'..',end)
    print('DONE: Sales + Budget -> Months')

if __name__=='__main__': main()
