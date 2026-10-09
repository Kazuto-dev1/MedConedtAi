from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="MedConecta AI - Servico de IA", version="0.1.0")


@app.get("/health")
def health():
    return {"status": "ok", "service": "ai"}


class RiskFeatures(BaseModel):
    idade: int
    tempo_desde_ultimo_exame_meses: int | None = None
    historico_alterado: bool = False
    sinais_alerta: bool = False


@app.post("/risk/predict")
def prever_risco(f: RiskFeatures):
    # Stub provisorio (sem modelo treinado). Sera substituido pelo scikit-learn.
    score = 0.2
    if f.sinais_alerta:
        score += 0.4
    if f.historico_alterado:
        score += 0.3
    if f.idade >= 35:
        score += 0.1
    prob = min(score, 0.99)
    nivel = "alto" if prob >= 0.6 else "medio" if prob >= 0.3 else "baixo"
    return {"nivel": nivel, "probabilidade": round(prob, 4)}


class NoShowFeatures(BaseModel):
    antecedencia_dias: int
    historico_faltas: int


@app.post("/no-show/predict")
def prever_no_show(f: NoShowFeatures):
    # Stub provisorio. Limiar de alto risco: >= 0.50 (DEC-003).
    prob = 0.2 + 0.05 * f.historico_faltas - 0.01 * f.antecedencia_dias
    prob = max(0.0, min(prob, 0.99))
    risco = "alto" if prob >= 0.5 else "medio" if prob >= 0.25 else "baixo"
    return {"probabilidade": round(prob, 4), "risco": risco}
