# Maison Laminée

크루아상이 만들어지는 과정(반죽 → 버터 → 접기 → 성형 → 굽기 → 쪼개기)을 스크롤 하나로 이어 보여주는 베이커리 랜딩 페이지입니다.

- **스틸**: GPT Image 2.5 Flare (Atlas Cloud) — 앞 장면을 참조해 카메라·조명을 고정한 채 피사체만 바꿈
- **영상**: Seedance 2.0 Mini Image-to-Video — 앞 스틸을 첫 프레임, 다음 스틸을 마지막 프레임으로 지정해 클립끼리 끊김 없이 이어짐
- **재생**: 클립을 WebP 프레임으로 변환해 챕터별 스크롤 위치에 맞춰 캔버스에 표시
- **포맷**: 가로(16:9)와 세로(9:16)를 각각 만들고 화면 방향에 맞는 쪽을 재생
- **스크롤/모션**: GSAP ScrollTrigger, SplitText, Lenis
- **디자인**: Emil Kowalski design-eng · Impeccable · taste-skill 세 스킬로 다시 설계 (결정 사항은 `DESIGN.md`, 제품 정보는 `PRODUCT.md`)

## 준비

```bash
npm install
cp .env.example .env   # ATLASCLOUD_API_KEY 입력
```

ffmpeg가 PATH에 있어야 합니다.

## 생성

```bash
npm run generate                 # 실행 계획과 예상 비용만 출력
npm run generate -- --yes        # 실제 생성 (스틸 → 클립 → 프레임)
```

| 옵션 | 설명 |
|---|---|
| `--format landscape,portrait` | 일부 포맷만 생성 |
| `--step image,video,frames` | 특정 단계만 실행 |
| `--force` | 이미 생성된 결과도 다시 생성 |

- 원본은 `generated/{stills,clips}/<format>/`, 장식 이미지는 `generated/extras/`에 캐시되며 이미 있는 파일은 건너뜁니다.
- 스틸은 앞 스틸을 참조하므로 순서대로 생성되고, 세로 스틸은 가로 스틸의 구도를 다시 잡아 만듭니다.
- 클립은 스틸만 있으면 되므로 병렬로 생성됩니다.

## 구성 변경

| 파일 | 수정 내용 |
|---|---|
| `story.config.mjs` | 공통 화풍(`style`), 포맷별 구도·해상도(`formats`), 스틸(`stills`)과 그 사이 움직임(`clips`), 장식 이미지(`extras`) |
| `index.html` | 챕터 순서·문구, 스크롤 길이(`--length`), 메뉴판 가격, 영업시간·트레이 시간(`data-trays`) |

`index.html`의 `data-clip` 값은 `clips`의 id와 일치해야 합니다. `data-clip`이 없는 마지막 챕터는 마지막 프레임을 유지합니다.

## 구조

| 파일 | 역할 |
|---|---|
| `src/main.js` | 클립 수집, 프리로드, 챕터별 재생·문구 전환 |
| `src/film/canvas-renderer.js` | 프레임을 영역에 맞춰 캔버스에 그리고, 메뉴 아래 밝기를 측정함 |
| `src/film/scene-track.js` | 클립별 프레임 로딩 및 조회 |
| `src/visit/open-status.js` | 파리 시간 기준 영업 상태와 다음 트레이 시각 |
| `scripts/generate.mjs` | Atlas Cloud 생성 파이프라인 |
| `scripts/lib/atlas-client.mjs` | Atlas Cloud API 클라이언트 (재시도·폴링·업로드) |
| `scripts/lib/frames.mjs` | 영상 → WebP 프레임, 스틸 → WebP 변환 |

## 디자인 검사

taste-skill의 검사 스크립트로 금지 패턴과 실제 렌더링을 확인합니다. 스크립트는 `.claude/skills/taste-skill/` (상위 폴더)에 있습니다.

```bash
npm run build && npx vite preview --port 4319
node ../.claude/skills/taste-skill/scripts/lint.mjs index.html src
node ../.claude/skills/taste-skill/scripts/inspect.mjs http://localhost:4319/
```

결과와 스크린샷은 `.taste-skill/`(git 제외)에 저장됩니다. 프로덕션 빌드 기준 0 FAIL이어야 합니다.
