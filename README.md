# Vellum Theme

Warm ivory parchment meets material high contrast dark. Two extremes, one identity.

두 가지 테마와 라이브 커스터마이징 기능을 제공하는 VS Code 테마 익스텐션입니다.

---

## 테마 미리보기

### Ivory Light
따뜻한 아이보리 톤의 라이트 테마. 장시간 코딩 시 눈의 피로를 줄여줍니다.

| 항목 | 색상 |
|------|------|
| 배경 | `#FDFAF3` |
| Keyword | `#7C3F00` (갈색) |
| String | `#2D6A4F` (녹색) |
| Function | `#1A5276` (파랑) |
| Type / Class | `#6B3FA0` (보라) |
| Number | `#A0522D` (시에나) |
| Comment | `#9A8668` (웜 그레이, italic) |

### Material HC Dark
Material Design 기반 하이 컨트라스트 다크 테마. 선명한 색상 대비로 가독성을 극대화합니다.

| 항목 | 색상 |
|------|------|
| 배경 | `#000000` |
| Keyword | `#FF5370` (빨강) |
| String | `#C3E88D` (연두) |
| Function | `#82AAFF` (파랑) |
| Type / Class | `#FFCB6B` (노랑) |
| Number | `#F78C6C` (오렌지) |
| Comment | `#546E7A` (슬레이트, italic) |

---

## 설치

### VSIX 직접 설치 (로컬)

1. VS Code에서 `Cmd+Shift+P` (Mac) / `Ctrl+Shift+P` (Windows/Linux)
2. `Extensions: Install from VSIX...` 검색 후 선택
3. `vellum-theme-0.1.0.vsix` 파일 선택
4. 설치 완료 후 VS Code 재시작 (또는 `Reload Window`)

### 빌드 후 설치 (개발자용)

```bash
# 의존성 설치
pnpm install

# TypeScript 컴파일
pnpm run compile

# VSIX 패키지 생성
pnpm run package

# VS Code에 설치
code --install-extension vellum-theme-0.1.0.vsix
```

---

## 테마 적용

1. `Cmd+K Cmd+T` (Mac) / `Ctrl+K Ctrl+T` (Windows/Linux)
2. 테마 목록에서 선택:
   - **Ivory Light** — 라이트 테마
   - **Material HC Dark** — 다크 테마

---

## 커스터마이징

### 방법 1 — 커맨드 팔레트 (추천)

1. `Cmd+Shift+P` → **`Vellum Theme: Customize Colors`** 실행
2. 변경할 항목 선택:
   - `Accent Color` — 상태바, 배지, 버튼
   - `Background Color` — 에디터 배경
   - `Keyword Color` — `if`, `const`, `return` 등
   - `String Color` — 문자열 리터럴
   - `Function Color` — 함수/메서드 이름
3. hex 색상 코드 입력 (예: `#FF5370`)
4. 즉시 반영됩니다.

### 방법 2 — VS Code 설정 (settings.json)

`Cmd+,` → 우측 상단 `{}` 아이콘으로 JSON 열기

```jsonc
{
  // Ivory Light 커스터마이징
  "vellumTheme.ivory.accentColor": "#8B7355",
  "vellumTheme.ivory.backgroundColor": "#FDFAF3",
  "vellumTheme.ivory.keywordColor": "#7C3F00",
  "vellumTheme.ivory.stringColor": "#2D6A4F",
  "vellumTheme.ivory.functionColor": "#1A5276",

  // Material HC Dark 커스터마이징
  "vellumTheme.materialHC.accentColor": "#82AAFF",
  "vellumTheme.materialHC.backgroundColor": "#000000",
  "vellumTheme.materialHC.keywordColor": "#FF5370",
  "vellumTheme.materialHC.stringColor": "#C3E88D",
  "vellumTheme.materialHC.functionColor": "#82AAFF"
}
```

저장하면 즉시 적용됩니다.

### 방법 3 — 세밀한 색상 오버라이드

VS Code 기본 제공 기능으로 원하는 색상을 직접 덮어쓸 수 있습니다.

```jsonc
{
  // 테마별로 특정 UI 색상만 덮어쓰기
  "workbench.colorCustomizations": {
    "[Ivory Light]": {
      "editor.background": "#FFFFF0",
      "sideBar.background": "#F5F0E0"
    },
    "[Material HC Dark]": {
      "editor.background": "#0D0D0D",
      "statusBar.background": "#FF5370"
    }
  },

  // 테마별로 문법 색상만 덮어쓰기
  "editor.tokenColorCustomizations": {
    "[Ivory Light]": {
      "textMateRules": [
        {
          "scope": ["variable.parameter"],
          "settings": { "foreground": "#8B0000", "fontStyle": "italic" }
        }
      ]
    }
  }
}
```

### 초기화

`Cmd+Shift+P` → **`Vellum Theme: Reset to Defaults`**

---

## 설정 항목 전체 목록

| 설정 키 | 기본값 | 설명 |
|---------|--------|------|
| `vellumTheme.ivory.accentColor` | `#8B7355` | Ivory — accent 색상 |
| `vellumTheme.ivory.backgroundColor` | `#FDFAF3` | Ivory — 에디터 배경 |
| `vellumTheme.ivory.keywordColor` | `#7C3F00` | Ivory — 키워드 색상 |
| `vellumTheme.ivory.stringColor` | `#2D6A4F` | Ivory — 문자열 색상 |
| `vellumTheme.ivory.functionColor` | `#1A5276` | Ivory — 함수 색상 |
| `vellumTheme.materialHC.accentColor` | `#82AAFF` | Material HC — accent 색상 |
| `vellumTheme.materialHC.backgroundColor` | `#000000` | Material HC — 에디터 배경 |
| `vellumTheme.materialHC.keywordColor` | `#FF5370` | Material HC — 키워드 색상 |
| `vellumTheme.materialHC.stringColor` | `#C3E88D` | Material HC — 문자열 색상 |
| `vellumTheme.materialHC.functionColor` | `#82AAFF` | Material HC — 함수 색상 |

---

## 개발 스크립트

```bash
pnpm run compile   # TypeScript 컴파일
pnpm run watch     # 파일 변경 감지 후 자동 컴파일
pnpm run lint      # ESLint 검사
pnpm run package   # .vsix 패키지 생성
```

---

## 지원 언어

JavaScript / TypeScript / Python / Rust / Go / Java / C/C++ / HTML / CSS / JSON / Markdown / YAML / Shell 등 VS Code TextMate 문법을 사용하는 모든 언어 지원.
