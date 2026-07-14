# Starot 타로 카드 이미지 생성 가이드 (총 79장)

> **이 문서는 이미지 생성 에이전트(Codex)가 한 번 읽고 끝까지 수행하는 자급자족형 작업 지시서입니다.**
> 78장의 타로 카드 + 1장의 카드 뒷면을 생성하고, 검증 스크립트로 누락/불량을 확인한 뒤,
> 실패한 카드만 재생성하는 루프를 파일 79개가 모두 통과할 때까지 반복합니다.

---

## 1. 출력 사양 (반드시 준수)

| 항목 | 값 |
|---|---|
| 출력 디렉토리 | `public/cards/` (리포 루트 기준, 없으면 생성) |
| 파일 포맷 | PNG |
| 해상도 | **1024 × 1536** (세로 2:3). 미지원 시 가장 가까운 세로 비율 사용 후 리포트에 명시 |
| 총 파일 수 | **79개** (아래 §4 파일명 목록과 정확히 일치해야 함) |
| 텍스트 | **이미지 안에 글자·숫자·문자 절대 금지** (카드 이름은 앱이 별도로 표시함) |

파일명 규칙 (앱 코드 `constants.ts`와 1:1 매핑되므로 임의 변경 금지):

- 메이저 아르카나: `major-00.png` ~ `major-21.png`
- 마이너 아르카나: `{suit}-{rank}.png`
  - suit: `wands` `cups` `swords` `pentacles`
  - rank: `01`(Ace) ~ `10`, `11`(Page), `12`(Knight), `13`(Queen), `14`(King)
- 카드 뒷면: `back.png`

---

## 2. 통일 스타일 블록 — STYLE_PREFIX (가장 중요한 규칙)

**79장 전부 아래 블록을 프롬프트 맨 앞에 그대로 붙인다. 단어 하나도 바꾸지 말 것.**
스타일 일관성이 이 작업의 성패를 가른다. 카드마다 화풍이 다르면 전량 재작업이다.

```text
A tarot card illustration in a single unified art style: elegant hand-painted
art-nouveau tarot deck, fine gold linework on deep midnight-indigo and violet
background, luminous gold and warm amber accents, muted jewel tones (amethyst,
sapphire, antique gold, ivory), soft ethereal glow, subtle star and constellation
motifs scattered in the dark sky background. Every card shares the identical
ornate thin gold border frame: a simple double-line gold rectangular frame with
a small four-pointed star ornament in each corner, on a midnight-indigo margin.
Flat illustration with delicate shading, consistent line weight, consistent
color temperature across the whole deck. Portrait orientation 2:3, the central
figure fills roughly 70% of the frame height, symmetric balanced composition.
Absolutely NO text, NO letters, NO numbers, NO captions, NO signature anywhere.
Scene:
```

최종 프롬프트 = `STYLE_PREFIX` + (아래 표의 Scene 문장). 다른 문구를 추가하지 않는다.

**일관성 보강 팁 (도구가 지원하는 경우):**
- 시드 고정이 가능하면 전 카드 동일 시드 사용.
- 레퍼런스 이미지 입력이 가능하면: 먼저 `major-00.png`(광대)를 생성해 사람이 승인한 뒤,
  그 이미지를 스타일 레퍼런스로 나머지 78장에 첨부.
- 배치 중간에 모델/파라미터(품질, 사이즈)를 바꾸지 말 것.

---

## 3. 생성 절차

1. `public/cards/` 디렉토리 생성.
2. **파일럿 3장 먼저 생성**: `major-00`, `cups-02`, `swords-10`.
   세 장을 나란히 놓고 §6 일관성 체크리스트로 스스로 평가. 통과 못 하면
   STYLE_PREFIX를 유지한 채 재생성(프롬프트 수정 금지, 재시도만).
3. 파일럿 통과 후 나머지 76장을 배치 생성. rate limit을 만나면 지수 백오프로 재시도
   (권장: 실패 시 10s → 30s → 60s, 3회 초과 실패 카드는 목록에 기록하고 다음 카드 진행).
4. 전체 생성 후 §5 검증 스크립트 실행.
5. 검증 실패(누락·0바이트·크기 불일치) 카드만 골라 재생성 → 재검증. **79/79 통과까지 반복.**
6. 최종 리포트 작성: 생성 성공 79장 확인, 재시도 횟수, 사용 모델/파라미터, 특이사항.

---

## 4. 카드별 Scene 프롬프트 (79장)

### 메이저 아르카나 (22장)

| 파일명 | 카드 | Scene |
|---|---|---|
| major-00.png | The Fool | A carefree young traveler stepping toward a cliff edge, holding a white rose, a small knapsack on a staff over the shoulder, a little white dog leaping at the heels, radiant sun above golden mountains. |
| major-01.png | The Magician | A confident magician at an altar, one arm raised holding a glowing wand toward the sky, the other pointing to the earth, an infinity halo above the head, a wand, chalice, sword and golden pentacle laid on the table, red roses and white lilies around. |
| major-02.png | The High Priestess | A serene priestess seated between two tall pillars, one dark and one light, a crescent moon at her feet, a veil embroidered with pomegranates behind her, a rolled scroll in her lap, still water beyond the veil. |
| major-03.png | The Empress | A graceful crowned empress reclining on a cushioned throne in a golden wheat field, a heart-shaped shield with a venus symbol beside her, lush forest and a waterfall behind, crown of stars. |
| major-04.png | The Emperor | A stern bearded emperor on a massive stone throne carved with ram heads, holding an ankh scepter and a golden orb, red robe over armor, barren orange mountains behind. |
| major-05.png | The Hierophant | A solemn high priest on a throne between two stone pillars, wearing a triple crown, right hand raised in blessing, two crossed golden keys at his feet, two tonsured acolytes kneeling before him. |
| major-06.png | The Lovers | A man and a woman standing in a garden gazing at each other beneath a great radiant angel with open wings, a fruit tree with a coiled serpent behind the woman, a tree of small flames behind the man, a mountain between them. |
| major-07.png | The Chariot | A crowned warrior standing in a stone chariot beneath a starry canopy, pulled by two resting sphinxes, one black and one white, a walled city and river behind, crescent moons on his shoulders. |
| major-08.png | Strength | A calm woman in a white gown gently closing the jaws of a golden lion with bare hands, an infinity halo above her head, a garland of flowers around her waist, green meadow and blue mountain. |
| major-09.png | The Hermit | A cloaked elder standing alone on a snowy mountain peak, holding up a lantern containing a glowing six-pointed star, leaning on a long staff, deep night sky. |
| major-10.png | Wheel of Fortune | A great golden wheel floating in a cloudy sky, a sphinx with a sword seated on top, a serpent descending on one side and a jackal-headed figure rising on the other, four small winged creatures reading books in the corners of the sky. |
| major-11.png | Justice | A crowned figure seated on a stone throne between two pillars, holding an upright double-edged sword in one hand and perfectly balanced golden scales in the other, a purple veil behind. |
| major-12.png | The Hanged Man | A serene young man suspended upside-down by one ankle from a living T-shaped tree, his free leg bent behind the knee, hands behind his back, a bright golden halo around his peaceful face. |
| major-13.png | Death | A skeleton in black armor riding a white horse, carrying a black banner with a white five-petaled rose, a fallen crown on the ground, a bishop pleading, the sun rising between two distant towers. |
| major-14.png | Temperance | A winged angel in a white robe pouring water in a flowing arc between two golden cups, one foot on a rock and one in a pool, yellow irises blooming, a glowing path leading to mountains and a rising crown of light. |
| major-15.png | The Devil | A horned goat-headed figure with bat wings squatting on a black pedestal, an inverted pentagram above its brow, a man and a woman with small horns loosely chained to the pedestal, dark cavern background. |
| major-16.png | The Tower | A tall stone tower on a crag struck by a jagged lightning bolt, its golden crown blasted off, flames bursting from windows, two figures falling through the dark storm, sparks of golden fire raining down. |
| major-17.png | The Star | A graceful woman kneeling at the edge of a still pool under a night sky, pouring water from two jugs, one onto land and one into the water, one large radiant eight-pointed golden star surrounded by seven smaller stars, a bird perched in a tree behind. |
| major-18.png | The Moon | A full moon with a calm sleeping face dripping dew, flanked by two distant stone towers, a dog and a wolf howling upward, a crayfish crawling out of a dark pool onto a winding path that disappears into the mountains. |
| major-19.png | The Sun | A huge radiant sun with a serene face, a joyful naked child with open arms riding a white horse, a large red banner flowing, a garden wall with four tall sunflowers. |
| major-20.png | Judgement | A mighty angel emerging from clouds blowing a golden trumpet with a banner, people rising from stone coffins on a sea, arms lifted in awe, icy mountains on the horizon. |
| major-21.png | The World | A dancing figure draped in a flowing purple sash, holding a small wand in each hand, framed by a large oval laurel wreath bound with red ribbons, four creatures in the corners: an angel, an eagle, a lion and a bull among clouds. |

### 지팡이 / Wands (14장)

| 파일명 | 카드 | Scene |
|---|---|---|
| wands-01.png | Ace of Wands | A radiant hand emerging from a golden cloud, gripping a living wooden wand sprouting fresh green leaves, a castle on a distant hill, a winding river below. |
| wands-02.png | Two of Wands | A cloaked man standing on a castle battlement holding a small globe in one hand and a tall wand in the other, a second wand fixed to the wall, gazing over the sea toward distant mountains. |
| wands-03.png | Three of Wands | A merchant seen from behind standing on a cliff top among three planted wands, watching golden ships sail across a calm amber sea. |
| wands-04.png | Four of Wands | Four tall wands supporting a garland canopy of flowers and fruit, two celebrating figures raising bouquets beneath it, a festive castle courtyard behind. |
| wands-05.png | Five of Wands | Five young men in colorful tunics playfully sparring, each brandishing a long wooden wand, dynamic crossed staves under an open sky. |
| wands-06.png | Six of Wands | A laurel-crowned rider on a white horse draped in green, holding a wand topped with a victory wreath, a cheering crowd with raised wands around him. |
| wands-07.png | Seven of Wands | A determined man standing on a high green ridge, gripping a wand with both hands, fending off six wands thrusting up from below the edge. |
| wands-08.png | Eight of Wands | Eight sprouting wands flying in parallel through a clear sky above a green river valley with a small house on a hill. |
| wands-09.png | Nine of Wands | A weary bandaged fighter leaning on his wand, glancing warily sideways, eight upright wands forming a fence behind him. |
| wands-10.png | Ten of Wands | A man bent forward carrying a heavy awkward bundle of ten long wands in his arms, trudging toward a town on the horizon. |
| wands-11.png | Page of Wands | A young page in an ornate tunic decorated with salamander patterns, standing in a desert with distant pyramids, holding up a tall sprouting wand and studying its tip with curiosity. |
| wands-12.png | Knight of Wands | An armored knight on a rearing golden horse, holding a sprouting wand aloft, a flame-like orange plume streaming from his helmet, desert dunes and pyramids behind. |
| wands-13.png | Queen of Wands | A warm regal queen on a throne carved with lions and sunflowers, holding a large sunflower in one hand and a wand in the other, a black cat seated at her feet. |
| wands-14.png | King of Wands | A commanding king seated on a throne carved with salamanders and lions, holding a tall flowering wand, a small salamander at the base of his throne, robe of flame patterns. |

### 컵 / Cups (14장)

| 파일명 | 카드 | Scene |
|---|---|---|
| cups-01.png | Ace of Cups | A radiant hand emerging from a golden cloud holding an overflowing golden chalice, a white dove descending toward it, five streams of water pouring into a lotus pond below. |
| cups-02.png | Two of Cups | A young man and woman facing each other, solemnly exchanging golden cups, above them a winged lion head over a caduceus with two entwined serpents, a cottage on a hill behind. |
| cups-03.png | Three of Cups | Three women in flowing gowns dancing in a circle, raising three golden cups high in a toast, autumn fruits and pumpkins at their feet. |
| cups-04.png | Four of Cups | A young man sitting cross-armed under a tree on a hill, eyes closed in contemplation, three golden cups on the grass before him, a fourth cup offered by a small hand from a cloud. |
| cups-05.png | Five of Cups | A figure in a long black cloak standing with head bowed, three golden cups spilled at his feet, two upright cups behind him, a river and a stone bridge leading to a small castle. |
| cups-06.png | Six of Cups | A child in an old walled garden handing a golden cup filled with white star-shaped flowers to a smaller child, six cups of flowers arranged around them, a quiet manor courtyard. |
| cups-07.png | Seven of Cups | A silhouetted figure facing seven golden cups floating on a great cloud, each holding a vision: a castle, jewels, a laurel wreath, a dragon, a glowing shrouded figure, a serene face, a serpent. |
| cups-08.png | Eight of Cups | A cloaked traveler with a staff walking away up a rocky path toward dark mountains under an eclipsed moon with a face, leaving eight neatly stacked golden cups behind. |
| cups-09.png | Nine of Cups | A satisfied plump man seated on a small bench with arms crossed, nine golden cups arranged in a high arc on a draped table behind him. |
| cups-10.png | Ten of Cups | A couple standing with arms raised toward a shining rainbow of ten golden cups arcing across the sky, two children dancing beside them, a cozy cottage and river in a green valley. |
| cups-11.png | Page of Cups | A whimsical young page in a floral tunic and beret standing by the seashore, holding a golden cup from which a small fish pops out to look at him. |
| cups-12.png | Knight of Cups | A graceful knight in winged helmet riding a calm white horse at a slow walk, holding a golden cup steadily forward, a river winding through the valley behind. |
| cups-13.png | Queen of Cups | A gentle dreamy queen on an ornate shell-shaped throne at the water's edge, gazing at a magnificent closed golden chalice with angel-shaped handles, calm sea and cliffs. |
| cups-14.png | King of Cups | A composed king on a stone throne that seems to float on a rolling sea, holding a golden cup and a lotus scepter, a ship and a leaping dolphin in the waves behind. |

### 검 / Swords (14장)

| 파일명 | 카드 | Scene |
|---|---|---|
| swords-01.png | Ace of Swords | A radiant hand emerging from a cloud gripping an upright silver sword, its tip passing through a golden crown hung with a laurel and a palm branch, jagged mountains below. |
| swords-02.png | Two of Swords | A blindfolded woman in a white robe seated on a stone bench before a rocky sea, arms crossed holding two long swords balanced over her shoulders, a crescent moon in the sky. |
| swords-03.png | Three of Swords | A large red heart pierced by three straight silver swords, heavy grey storm clouds and slanting rain behind. |
| swords-04.png | Four of Swords | A stone chapel interior, a knight lying in peaceful repose on a tomb with hands in prayer, three swords hanging on the wall above him, one sword carved along the tomb's side, a stained glass window. |
| swords-05.png | Five of Swords | A smirking man gathering three swords in his arms, two more swords on the ground, two dejected figures walking away toward a choppy sea under jagged wind-torn clouds. |
| swords-06.png | Six of Swords | A ferryman poling a small wooden boat across calm grey water, a cloaked woman and child seated inside, six swords standing upright in the bow, a far shore of low trees. |
| swords-07.png | Seven of Swords | A man in a fur hat tiptoeing away from a camp of colorful tents, carrying five swords awkwardly in his arms and glancing back, two swords left standing in the ground. |
| swords-08.png | Eight of Swords | A blindfolded woman in a red dress, loosely bound, standing among eight swords planted in marshy ground like a cage, a castle on a distant grey cliff. |
| swords-09.png | Nine of Swords | A person sitting up in bed in the dark, face buried in their hands, nine horizontal swords mounted on the black wall above, a quilt decorated with roses and zodiac symbols. |
| swords-10.png | Ten of Swords | A figure lying face-down on a desolate shore with ten swords standing in his back, a pitch-black sky beginning to break into a golden dawn on the horizon over still water. |
| swords-11.png | Page of Swords | An alert youth standing on a windy hilltop, holding a sword upright with both hands, hair and clothes blown by the wind, scudding clouds and a flock of birds. |
| swords-12.png | Knight of Swords | A fierce knight charging at full gallop on a grey horse, sword raised high, cape and plume streaming, wind-bent trees and ragged storm clouds. |
| swords-13.png | Queen of Swords | A stern wise queen on a throne carved with butterflies and a winged cherub, holding an upright sword, her other hand extended in welcome, tall clear sky with a single bird. |
| swords-14.png | King of Swords | A resolute king facing directly forward on a stone throne carved with butterflies and crescent moons, holding an upright double-edged sword, a still blue sky with two small birds. |

### 동전 / Pentacles (14장)

| 파일명 | 카드 | Scene |
|---|---|---|
| pentacles-01.png | Ace of Pentacles | A radiant hand emerging from a golden cloud holding a large golden pentacle coin engraved with a five-pointed star, a lush garden below with a flowering hedge archway opening to distant mountains. |
| pentacles-02.png | Two of Pentacles | A young man in a tall hat dancing on one foot, juggling two golden pentacles connected by a green ribbon shaped like an infinity loop, two ships riding huge waves behind. |
| pentacles-03.png | Three of Pentacles | A young stonemason standing on a bench carving inside a cathedral archway, a monk and a hooded architect holding building plans beside him, three pentacles carved into the stone arch above. |
| pentacles-04.png | Four of Pentacles | A crowned man seated on a stone bench, clutching one golden pentacle tightly to his chest, one balanced on his crown and one under each foot, a city skyline behind. |
| pentacles-05.png | Five of Pentacles | Two ragged figures trudging through falling snow, one on crutches, passing beneath a glowing stained-glass church window with five golden pentacles arranged like a tree. |
| pentacles-06.png | Six of Pentacles | A wealthy merchant in a rich red robe holding golden balance scales in one hand, dropping coins into the hands of two kneeling beggars, six pentacles floating around him. |
| pentacles-07.png | Seven of Pentacles | A young farmer leaning on his hoe, gazing thoughtfully at a lush green vine on which seven golden pentacles are growing like fruit. |
| pentacles-08.png | Eight of Pentacles | A focused apprentice sitting on a bench diligently chiseling a golden pentacle, six finished pentacles displayed on the post beside him, one at his feet, a town far on the horizon. |
| pentacles-09.png | Nine of Pentacles | An elegant woman in a flowing gold-patterned gown standing in a ripe vineyard, a hooded falcon perched on her gloved hand, nine golden pentacles nestled among the vines, a manor behind. |
| pentacles-10.png | Ten of Pentacles | A white-bearded elder in an ornate robe seated with two dogs beneath a stone archway, a young couple and a child in the market square beyond, ten golden pentacles arranged across the scene like a tree of life. |
| pentacles-11.png | Page of Pentacles | A studious youth standing alone in a flowering meadow, holding up a single golden pentacle with both hands and gazing at it intently, a plowed field and small grove behind. |
| pentacles-12.png | Knight of Pentacles | A patient knight sitting motionless on a heavy black draft horse, holding a golden pentacle out before him and contemplating it, neatly plowed brown fields. |
| pentacles-13.png | Queen of Pentacles | A nurturing queen on a throne carved with goats, fruit and angels, cradling a golden pentacle in her lap, a small rabbit at the corner, an arbor of red roses overhead. |
| pentacles-14.png | King of Pentacles | A prosperous king on a throne carved with bulls, his dark robe embroidered with grape vines, one hand resting on a golden pentacle, a scepter in the other, his castle behind a stone wall. |

### 카드 뒷면 (1장)

| 파일명 | 용도 | Scene |
|---|---|---|
| back.png | 덱 뒷면 | A perfectly symmetric ornamental tarot card back design: a large radiant gold eight-pointed star at the center of a deep midnight-indigo field, surrounded by concentric rings of small stars, crescent moons and fine gold filigree, mirrored top-to-bottom and left-to-right so the card looks identical upside down. |

---

## 5. 검증 스크립트 (생성 완료 후 반드시 실행)

리포 루트에서 실행. 79개 파일의 존재·용량·해상도를 검사하고 실패 목록을 출력한다.

```bash
#!/bin/bash
# verify-cards.sh — public/cards/ 검증
DIR="public/cards"
FAIL=0

# 기대 파일 목록 생성
EXPECTED=()
for i in $(seq -w 0 21); do EXPECTED+=("major-$(printf '%02d' $((10#$i))).png"); done
for suit in wands cups swords pentacles; do
  for r in $(seq 1 14); do EXPECTED+=("$suit-$(printf '%02d' $r).png"); done
done
EXPECTED+=("back.png")

echo "기대 파일 수: ${#EXPECTED[@]} (79여야 함)"

for f in "${EXPECTED[@]}"; do
  p="$DIR/$f"
  if [ ! -f "$p" ]; then echo "MISSING: $f"; FAIL=1; continue; fi
  size=$(stat -f%z "$p" 2>/dev/null || stat -c%s "$p")
  if [ "$size" -lt 10000 ]; then echo "TOO_SMALL(${size}B): $f"; FAIL=1; continue; fi
  dims=$(sips -g pixelWidth -g pixelHeight "$p" 2>/dev/null | awk '/pixel/{print $2}' | paste -sd'x' -)
  w=${dims%x*}; h=${dims#*x}
  if [ -z "$w" ] || [ -z "$h" ]; then echo "UNREADABLE: $f"; FAIL=1; continue; fi
  # 세로형 검사 (h > w)
  if [ "$h" -le "$w" ]; then echo "NOT_PORTRAIT(${dims}): $f"; FAIL=1; fi
done

actual=$(ls "$DIR"/*.png 2>/dev/null | wc -l | tr -d ' ')
echo "실제 파일 수: $actual"
[ "$actual" -ne 79 ] && { echo "COUNT_MISMATCH"; FAIL=1; }

[ "$FAIL" -eq 0 ] && echo "✅ ALL 79 PASSED" || echo "❌ FAILED — 위 목록 재생성 필요"
exit $FAIL
```

---

## 6. 스타일 일관성 체크리스트 (자동 검사 + 육안 검사)

스크립트 통과 후, 생성된 이미지를 그리드로 나열해 아래를 확인한다.
**하나라도 어긋난 카드는 동일 프롬프트로 재생성한다 (프롬프트 수정 금지).**

- [ ] 79장 모두 동일한 금색 이중선 테두리 + 네 모서리 별 장식이 있는가
- [ ] 배경 기조색이 전부 미드나잇 인디고/바이올렛 계열인가 (한 장만 밝거나 채도가 튀지 않는가)
- [ ] 선 굵기와 채색 방식(수채/플랫)이 카드 간에 눈에 띄게 다르지 않은가
- [ ] 이미지 안에 글자·숫자·서명·워터마크가 없는가 (특히 AI가 넣기 쉬운 카드 이름 텍스트)
- [ ] 인물의 손가락·얼굴 등 해부학적 파손이 없는가
- [ ] `back.png`가 상하 뒤집어도 동일하게 보이는가 (역방향 카드 연출에 필수)
- [ ] 같은 슈트 안에서 상징물(지팡이/컵/검/동전)의 디자인이 통일되어 있는가

---

## 7. 완료 리포트 양식

작업 종료 시 아래를 보고한다:

```
- 생성 완료: NN / 79
- 사용 모델·파라미터: (모델명, 해상도, 품질 옵션, 시드 고정 여부)
- 재생성한 카드와 사유: (예: swords-03 텍스트 아티팩트 1회 재생성)
- 검증 스크립트 결과: ALL 79 PASSED 여부
- 스타일 체크리스트: 통과 / 미해결 항목
- 미해결 이슈: (있다면)
```
