import asyncio,random,httpx
from .config import settings
class ProviderError(Exception): pass
async def _request(url,headers,payload):
    for attempt in range(4):
        try:
            async with httpx.AsyncClient(timeout=45) as c:
                r=await c.post(url,headers=headers,json=payload)
            if r.status_code in (429,503):
                if attempt==3: raise ProviderError('AI provider is temporarily busy.')
                retry=float(r.headers.get('retry-after','1'))
                await asyncio.sleep(min(12,retry*(2**attempt)+random.random()))
                continue
            r.raise_for_status(); return r.json()
        except (httpx.TimeoutException,httpx.NetworkError) as e:
            if attempt==3: raise ProviderError('AI provider is unavailable right now.') from e
            await asyncio.sleep(min(8,2**attempt+random.random()))
    raise ProviderError('AI provider is unavailable right now.')
async def generate(provider:str,prompt:str,kind:str):
    if provider=='gemini':
        key=settings.gemini_api_key
        if not key: raise ProviderError('Gemini is not configured.')
        model=settings.gemini_small_model if kind=='small' else settings.gemini_tutor_model
        data=await _request(f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}',{'Content-Type':'application/json'},{'contents':[{'parts':[{'text':prompt}]}],'generationConfig':{'temperature':0.25}})
        return data['candidates'][0]['content']['parts'][0]['text']
    key=settings.groq_api_key
    if not key: raise ProviderError('Groq is not configured.')
    model=settings.groq_small_model if kind=='small' else settings.groq_tutor_model
    data=await _request('https://api.groq.com/openai/v1/chat/completions',{'Authorization':f'Bearer {key}','Content-Type':'application/json'},{'model':model,'messages':[{'role':'user','content':prompt}],'temperature':0.25})
    return data['choices'][0]['message']['content']
