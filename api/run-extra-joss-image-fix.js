export default async function handler(req,res){
  const secret='ISSHO-TEMP-EXTRA-JOSS-20260903-7F4A';
  if(req.query?.key!==secret)return res.status(404).json({error:'Not found'});
  const url='https://xvhimyflrqrdudijwjdn.supabase.co/functions/v1/migrate-all-product-images-500-jpg85?token=ISSHO-500-JPG85-20260903-FINAL&offset=93&limit=1&force=1';
  try{
    const r=await fetch(url,{cache:'no-store'});
    const text=await r.text();
    res.status(r.status).setHeader('content-type','application/json').send(text);
  }catch(e){res.status(500).json({error:String(e?.message||e)})}
}
