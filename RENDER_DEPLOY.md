# Render.com 배포 가이드

## 1단계: GitHub에 코드 Push

```bash
# 1. GitHub에서 새 레포지토리 생성 (예: ai-insight-stock)
# 2. 로컬에서 연결

cd /mnt/agents/output/app
git remote add origin https://github.com/YOUR_USERNAME/ai-insight-stock.git
git branch -M main
git push -u origin main
```

## 2단계: Render.com 연결

1. [render.com](https://render.com) 가입/로그인
2. **Dashboard** → **New +** → **Web Service**
3. **Build and deploy from a Git repository** 선택
4. GitHub 레포지토리 연결 (`ai-insight-stock`)

## 3단계: 설정 자동 입력

`render.yaml`이 있으면 Render가 자동으로 설정을 읽습니다:

| 항목 | 값 |
|------|-----|
| **Name** | `ai-insight-stock` |
| **Region** | `Singapore` (한국과 가장 가까움) |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npx tsx server.ts` |
| **Plan** | Free (또는 Starter $7/월) |

## 4단계: 환경변수 설정

**Advanced** → **Add Environment Variable**:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `GEMINI_API_KEY` | `YOUR_GEMINI_API_KEY_HERE` (선택) |

> Gemini API Key는 [Google AI Studio](https://aistudio.google.com/)에서 묣으로 발급

## 5단계: 배포

**Create Web Service** 클릭 → 자동 빌드 & 배포 시작

배포 완료까지 약 **3-5분** 소요

## 결과

배포 완료 후 URL이 생성됩니다:
```
https://ai-insight-stock.onrender.com
```

이 URL에서는 **진정한 실시간 주가**가 표시됩니다:
- 종목 카드에 **실시간 LIVE 배지**
- **20초마다 자동 갱신**
- **Yahoo Finance 직접 연동** (CORS 프록시 불필요)

---

## 묣 플랜 vs Starter 플랜

| 기능 | Free | Starter ($7/월) |
|------|------|-----------------|
| 항상 켜짐 | X (15분 무응답 시 슬립) | O |
| CPU | 공유 | 공유 |
| RAM | 512MB | 512MB |
| 커스텀 도메인 | O | O |

**Free 플랜 사용 시**: 15분 동안 접속 없으면 서버가 슬립됨 → 다음 접속 시 30초~1분 "웜업" 시간

**Starter 추천**: $7/월에 항상 켜져 있어 실시간 데이터 즉시 확인 가능
