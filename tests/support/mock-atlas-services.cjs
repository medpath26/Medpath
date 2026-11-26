let reservations = 0;
globalThis.fetch = async (input, options) => {
  const req = new Request(input, options); const url = new URL(req.url);
  const json = (v, status=200) => new Response(JSON.stringify(v), {status,headers:{'content-type':'application/json'}});
  if (url.hostname === 'mock-supabase.local') {
    if (url.pathname === '/auth/v1/user') {
      if (req.headers.get('authorization') !== 'Bearer valid-test-token') return json({msg:'invalid'},401);
      return json({id:'00000000-0000-0000-0000-000000000001',aud:'authenticated',app_metadata:{},user_metadata:{}});
    }
    if (url.pathname === '/rest/v1/profiles') return json({healthcare_program:'Medical Assistant'});
    if (url.pathname === '/rest/v1/rpc/reserve_atlas_generation' || url.pathname === '/rest/v1/rpc/reserve_atlas_tutor_question') {
      const body = await req.json();
      const allowed = url.pathname.endsWith('reserve_atlas_generation') ? ['p_user_id', 'p_paid_daily_limit'] : ['p_user_id'];
      if (Object.keys(body).some(key => !allowed.includes(key))) return json({message:'unexpected reservation data'},400);
      return json(++reservations <= 3 ? 'ok' : 'limit');
    }
    return json({message:'unexpected mock endpoint'},404);
  }
  if (url.hostname === 'api.openai.com') {
    const body = await req.json();
    const data = body.text.format.name === 'teaching_explanation'
      ? {explanation:'A concept',example:'An example',analogy:'An analogy',caution:'Verify the details'}
      : {summary:['A key point'],flashcards:[{question:'What?',answer:'A term'}],quiz:[{question:'Why?',answer:'A reason',explanation:'Review the source'}]};
    return json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(data)}]}]});
  }
  throw new Error("Unexpected outbound request in synthetic integration test.");
};
