from typing import Any


def build_factuality_prompt(question: str, answer: str) -> str:
    return f'''You are a factuality-risk reviewer for an educational AI tutor. Review the answer against the user's question.

Do NOT decide truth from style alone. Identify concrete factual claims that could be checked, assess whether each is supported by the answer's internal context or is potentially risky, and distinguish uncertainty from demonstrated falsehood.

Return VALID JSON ONLY with this shape:
{{
  "overall_risk": "low|medium|high",
  "confidence": 0,
  "claims": [
    {{"claim": "...", "risk": "low|medium|high", "reason": "..."}}
  ],
  "verification_needed": ["..."],
  "summary": "..."
}}

Rules:
- confidence is 0-100 and means confidence in the review, not confidence that the answer is true.
- Do not invent sources or citations.
- If the answer makes no meaningful factual claims, use low risk and an empty claims list.
- Never expose hidden reasoning.

Question:
{question}

Answer:
{answer}'''


def normalize_factuality(value: dict[str, Any]) -> dict[str, Any]:
    risk = str(value.get('overall_risk') or 'medium').lower()
    if risk not in {'low', 'medium', 'high'}:
        risk = 'medium'
    try:
        confidence = max(0, min(100, int(value.get('confidence', 0))))
    except (TypeError, ValueError):
        confidence = 0
    claims = value.get('claims') if isinstance(value.get('claims'), list) else []
    verification = value.get('verification_needed') if isinstance(value.get('verification_needed'), list) else []
    return {
        'overall_risk': risk,
        'confidence': confidence,
        'claims': claims[:12],
        'verification_needed': [str(x) for x in verification[:12]],
        'summary': str(value.get('summary') or 'No additional factuality summary was provided.'),
    }
