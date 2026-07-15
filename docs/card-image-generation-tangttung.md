# 얼렁탕뚱 타로 카드 이미지 생성 가이드 (앞면 78장 + 뒷면 1장)

> 이 문서는 이미지 생성 에이전트가 한 번 읽고 끝까지 수행할 수 있는 자급자족형 작업 지시서입니다.
> 사용자가 제공한 탕뚱 사진 10장을 모두 정체성 레퍼런스로 사용해, 동일한 삽살개 탕뚱이
> 주인공인 타로 카드 앞면 78장과 전용 카드 뒷면 1장을 생성하고 검증합니다.
>
> 이 문서의 범위는 이미지 생성과 검증뿐입니다. 기존 덱 이동이나 앱 통합 작업은 포함하지 않습니다.

---

## 1. 목표와 출력 사양

| 항목 | 값 |
|---|---|
| 덱 ID | `tangttung` |
| 화면 표시명 | `얼렁탕뚱 타로` |
| 출력 디렉터리 | `public/decks/tangttung/` |
| 앞면 | 78장 (메이저 22장 + 마이너 56장) |
| 전용 뒷면 | 1장 (`back.png`) |
| 총 파일 수 | **79개** |
| 모델 | **GPT Image 2.0** |
| 파일 포맷 | PNG |
| 해상도 | **1024 x 1536** (세로 2:3) |
| 이미지 내 텍스트 | 글자, 숫자, 카드명, 서명, 워터마크 모두 금지 |

파일명은 기존 덱과 동일하게 유지한다.

- 메이저 아르카나: `major-00.png` ~ `major-21.png`
- 마이너 아르카나: `{suit}-{rank}.png`
  - suit: `wands`, `cups`, `swords`, `pentacles`
  - rank: `01` ~ `10`, `11`(Page), `12`(Knight), `13`(Queen), `14`(King)
- 카드 뒷면: `back.png`

기존 Starot 카드나 다른 디렉터리의 파일을 덮어쓰지 않는다.

---

## 2. 조사 근거와 시각 해석 원칙

인터넷 자료는 삽살개라는 견종의 역사적·시각적 맥락을 이해하는 용도로만 사용한다.
탕뚱의 실제 외형은 반드시 사용자가 제공한 사진 10장을 최우선 기준으로 삼는다.

- 한국삽살개재단은 장모 삽살개의 긴 털이 얼굴을 덮고, 둥글고 순한 눈, 크고 윤기 있는 검은 코,
  늘어진 귀, 굵고 곧은 앞다리, 굵고 긴 꼬리를 특징으로 설명한다. 
- 삽살개는 사람의 감정을 살피는 교감성, 사교성, 낯선 환경을 탐색하는 대담성, 점잖고 느긋한
  성품으로 소개된다. 탕뚱의 기본 연출은 사납기보다 온화하고 호기심 많은 수호자에 가깝게 잡는다.
  [한국삽살개재단 - 성품](https://www.sapsaree.org/open_content/dog/dog_06.php)
- `삽살`은 귀신이나 액운을 쫓는다는 의미와 연결되며, 삽살개는 영모화와 문배도 등에서 수호견
  모티프로 등장한다. 이 의미는 전용 카드 뒷면과 보호·회복 카드의 보조 모티프로만 사용한다.
  [한국삽살개재단 - 역사](https://www.sapsaree.org/open_content/dog/dog_01.php)
- `경산의 삽살개`는 1992년 3월 10일 지정된 천연기념물이다. 다만 이는 등록·관리되는 집단에 대한
  국가유산 명칭이므로, 문서나 이미지에서 **탕뚱 자체를 천연기념물이라고 표현하지 않는다.**
  [국가유산포털 - 경산의 삽살개](https://www.heritage.go.kr/heri/cul/culSelectDetail.do?ccbaCpno=1363703680000)
- 조선 후기 영모화의 자세와 기백은 참고할 수 있지만, 역사 작품 속 개의 외형을 탕뚱에게 복제하지
  않는다. [한국민족문화대백과 - 김두량 필 삽살개](https://encykorea.aks.ac.kr/Article/E0076484)

### 문화 모티프 사용 한계

- 문지방, 문배도식 대칭, 조선 영모화의 세필 털 묘사, 동해의 해돋이, 구름, 연꽃, 산수는 보조
  장식으로 사용할 수 있다.
- 기존 Starot 덱의 타로 상징과 아르누보 화풍이 우선이다. 한국적 모티프 때문에 카드의 원래 의미나
  필수 상징물이 사라져서는 안 된다.
- 공식 웹사이트의 사진이나 역사 회화를 직접 복제하지 않는다. 사실과 모티프만 참고한다.

---

## 3. 탕뚱 사진 10장 - 전부 필수 입력

아래 10장은 모두 같은 탕뚱을 보여주는 하나의 정체성 코퍼스다. **파일럿과 최종 79장 생성 호출마다
10장을 전부 레퍼런스 이미지로 첨부한다.** 일부 사진만 임의로 골라 쓰지 않는다.

| 번호 | 절대 경로 | 반드시 읽어낼 특징 |
|---:|---|---|
| 1 | `/Users/changyoon.park/Downloads/IMG_3150.jpg` | 장모 상태의 얼굴 정체성, 넓고 검은 코, 긴 주둥이, 수염, 눈 주변 음영, 밝은 표정 |
| 2 | `/Users/changyoon.park/Downloads/IMG_3151.jpg` | 장모 3/4 얼굴, 늘어진 회베이지색 귀, 눈과 앞머리 관계, 혀와 미소 표정 |
| 3 | `/Users/changyoon.park/Downloads/IMG_5243.png` | 정면 전신 비율, 긴 다리, 큰 발, 앉은 자세, 꼬리 위치, 미용 후 얼굴 구조 |
| 4 | `/Users/changyoon.park/Downloads/938DE312-E5ED-4EBF-B158-0A2E7D0F8735.png` | 야외 자연광의 크림색 털, 3/4 전신, 귀 색, 몸통과 다리 비율 |
| 5 | `/Users/changyoon.park/Downloads/IMG_4950.jpg` | 옆으로 누운 전신 길이, 다리 관절, 발바닥, 몸통 폭, 휴식 자세 |
| 6 | `/Users/changyoon.park/Downloads/IMG_4338.jpg` | 미용 후 정면 얼굴, 두상과 주둥이 비율, 곧은 앞다리, 앉은 전신, 꼬리 |
| 7 | `/Users/changyoon.park/Downloads/IMG_3552.jpg` | 중간 길이의 풍성한 털, 야외 전신, 가슴과 앞다리 볼륨, 활기찬 표정 |
| 8 | `/Users/changyoon.park/Downloads/IMG_4231.jpg` | 미용 후 3/4 얼굴, 회베이지 귀와 정수리 음영, 등과 뒷다리 비율 |
| 9 | `/Users/changyoon.park/Downloads/IMG_3592.jpg` | 장모 측면, 귀를 덮는 털, 자연광 털색, 앉은 자세, 풍성한 꼬리 |
| 10 | `/Users/changyoon.park/Downloads/IMG_8525.jpg` | 누운 측면, 굵고 물결치는 몸통 털, 큰 발, 길고 풍성한 꼬리, 편안한 표정 |

### 레퍼런스 사용 규칙

1. 사진의 공통된 신체 특징을 합쳐 **동일한 한 마리의 탕뚱**으로 재현한다.
2. 장모·미용 상태가 섞여 있으므로 최종 덱의 기본 모습은 `IMG_3150`, `IMG_3151`, `IMG_3552`,
   `IMG_3592`, `IMG_8525`의 **풍성한 중장모 모습**으로 통일한다. 미용 사진은 두상, 체형, 다리,
   발, 꼬리의 정확한 구조를 보완하는 데 사용한다.
3. 사진 속 실내, 미용실, 소파, 사람, 간판, 오키나와풍 배경은 복사하지 않는다.
4. 분홍 리드줄, 빨간 하네스, 목줄, 스카프는 탕뚱의 신체 특징이 아니다. 카드 Scene에 명시되지
   않는 한 생성하지 않는다.
5. 사진 10장을 모두 개별 첨부할 수 없는 도구 제한이 실제로 확인된 경우에만, 10장을 원본 비율로
   배열한 무손실 레퍼런스 시트를 만들고 그 시트와 핵심 원본을 함께 첨부한다. 이 경우에도 어떤
   사진이 누락됐는지 기록하고, 가능한 즉시 10장 개별 입력 방식으로 돌아간다.

---

## 4. 고정 프롬프트 블록

최종 프롬프트는 아래 순서를 반드시 지킨다.

```text
STYLE_PREFIX

TANGTTUNG_IDENTITY_BLOCK

CANINE_TAROT_RULES

Scene:
<카드별 Scene 문장>
```

네 블록의 문구와 순서를 카드마다 바꾸지 않는다. 카드별로 변경 가능한 부분은 마지막 Scene 문장뿐이다.

### 4.1 STYLE_PREFIX - 기존 Starot 화풍 계승

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
```

### 4.2 TANGTTUNG_IDENTITY_BLOCK - 동일 개체 고정

```text
The protagonist is Tangttung, the exact same adult Korean Sapsaree dog shown
across all ten supplied reference photographs. Synthesize the identity from all
ten photographs together, never from only one view. Tangttung is a sturdy
medium-large natural quadruped with long straight legs, large rounded paws, an
ivory-white to warm cream dense wavy shaggy coat, subtle pale gray-beige shading
on the floppy ears and crown, round gentle dark-brown eyes partially visible
through an irregular soft fringe, a broad glossy black nose, a long rectangular
shaggy muzzle and beard, and one long thick plumed tail carried low or in a soft
curve. Preserve Tangttung's exact facial proportions, ear placement, muzzle
length, body proportions, coat texture and calm friendly curious expression from
the photographs. Use the same full medium-long shaggy coat on every card. The dog
must remain instantly recognizable as Tangttung and as a Korean Sapsaree, not an
Old English Sheepdog, Tibetan Terrier, Wheaten Terrier, poodle or generic white dog.
```

### 4.3 CANINE_TAROT_RULES - 해부학·안전·상징 고정

```text
Tangttung keeps natural canine anatomy and proportions: four canine legs, two
floppy ears, one muzzle, one tail and real paws, with no human arms, hands,
fingers, feet or upright human body. Costumes, crowns, armor and fabric must drape
naturally over a quadruped body without hiding Tangttung's face, black nose,
gray-beige ears or shaggy coat. Tangttung is the single central protagonist;
supporting humans, animals or spirits must look clearly different and must not be
clones of Tangttung. Do not copy collars, harnesses, leashes, people, rooms,
signage or backgrounds from the reference photos unless the Scene explicitly
requires a related prop. Preserve the traditional tarot meaning, required props
and exact count of suit symbols in the Scene. Show danger, restraint, death and
conflict symbolically and non-graphically: no gore, wounds, impalement, animal
cruelty or visible suffering. No extra limbs, duplicate faces, duplicate tails,
merged paws or broken anatomy. Absolutely no text, letters, numbers, captions,
logos, signature or watermark.
```

---

## 5. 모델과 레퍼런스 입력 방식

기본 실행 방식은 Codex의 내장 `image_gen`을 사용한 GPT Image 2.0 생성이다.

- 한 번의 이미지 생성 호출에서는 한 카드만 생성한다. 각 카드는 최초 1회 생성하고, 검증 실패 시
  같은 카드만 별도의 호출로 재시도한다.
- 모든 호출에 §3의 사진 10장을 전부 `referenced_image_paths`로 첨부한다.
- 첫 파일럿 `major-00.png`에는 사진 10장과 기존 스타일 기준 이미지
  `public/decks/starot/major-00.png`를 함께 첨부한다.
- `major-00.png`가 승인된 뒤 나머지 카드에는 사진 10장과 새로 생성한
  `public/decks/tangttung/major-00.png`를 함께 첨부해 스타일과 개체 정체성을 이중 고정한다.
- 모델, 해상도, 품질 경로, 고정 프롬프트 블록, 레퍼런스 사진 집합을 배치 도중 바꾸지 않는다.
- 결과는 생성 후 `public/decks/tangttung/<filename>`으로 복사한다. 기본 생성 저장소에만 남겨두지 않는다.
- 기존 파일을 재생성할 때는 실패 사유와 시도 횟수를 기록한 뒤 같은 최종 프롬프트로 덮어쓴다.

---

## 6. 카드별 Scene 프롬프트 (앞면 78장)

아래 Scene 문장만 카드별 가변 영역이다. 모든 문장 앞에 §4의 세 고정 블록을 그대로 붙인다.

### 메이저 아르카나 (22장)

| 파일명 | 카드 | Scene |
|---|---|---|
| `major-00.png` | The Fool | Tangttung steps cheerfully toward the edge of a high cliff at sunrise, a white rose held gently in the mouth and a small travel satchel resting naturally across the back, one front paw lifted, a tiny golden butterfly dancing at the heels, radiant sun above golden mountains. |
| `major-01.png` | The Magician | Tangttung sits confidently before a ceremonial altar, one front paw lifted beneath a glowing wand floating toward the sky and the other paw touching the earth, an infinity halo above the head, with one wand, one chalice, one sword and one golden pentacle precisely arranged on the table, red roses and white lilies around. |
| `major-02.png` | The High Priestess | Tangttung sits serenely between two tall pillars, one dark and one light, a crescent moon at the front paws, a veil embroidered with pomegranates behind, a rolled scroll resting before the chest, still water beyond the veil. |
| `major-03.png` | The Empress | Tangttung reclines regally on a cushioned throne in a golden wheat field, wearing a light crown of stars fitted naturally above the shaggy head, a heart-shaped shield with a Venus symbol beside the throne, lush forest and a waterfall behind. |
| `major-04.png` | The Emperor | Tangttung sits sternly on a massive stone throne carved with ram heads, wearing a red mantle over ceremonial canine armor, an ankh scepter mounted upright on one side and a golden orb beneath one front paw, barren orange mountains behind. |
| `major-05.png` | The Hierophant | Tangttung sits solemnly on a throne between two stone pillars, wearing a lightweight triple crown and ceremonial mantle, one front paw raised in blessing, two crossed golden keys at the paws, with two clearly distinct human acolytes kneeling respectfully below. |
| `major-06.png` | The Lovers | Tangttung and one clearly distinct warm-golden companion dog stand facing each other in a garden beneath a great radiant angel with open wings, a fruit tree with a coiled serpent behind the companion, a tree of small flames behind Tangttung, a mountain between them. |
| `major-07.png` | The Chariot | Tangttung stands proudly in a stone chariot beneath a starry canopy, wearing a fitted crown and crescent ornaments on the shoulders, with two resting sphinxes before the chariot, one black and one white, a walled city and river behind. |
| `major-08.png` | Strength | Tangttung gently calms a golden lion by touching noses and resting one soft paw near the lion's mane, both animals peaceful, an infinity halo above Tangttung's head, a garland of flowers around the shoulders, green meadow and blue mountain behind. |
| `major-09.png` | The Hermit | Tangttung stands alone on a snowy mountain peak in a simple dark cloak, holding the handle of a lantern gently in the mouth, the lantern containing a glowing six-pointed star, a long staff planted beside the front paw, deep night sky. |
| `major-10.png` | Wheel of Fortune | Tangttung stands as the calm guardian at the center of a great golden wheel floating in a cloudy sky, a sphinx with a sword seated on top, a serpent descending on one side and a jackal-headed figure rising on the other, four small winged creatures reading books in the corners. |
| `major-11.png` | Justice | Tangttung sits directly forward on a stone throne between two pillars, wearing a restrained crown and purple mantle, an upright double-edged sword mounted beside one shoulder and perfectly balanced golden scales floating beside the other, a purple veil behind. |
| `major-12.png` | The Hanged Man | Tangttung hangs calmly upside down in a broad secure ceremonial silk sling suspended from a living T-shaped tree, the body fully supported and visibly unharmed, hind legs relaxed, front paws folded peacefully, a bright golden halo around the serene shaggy face. |
| `major-13.png` | Death | Tangttung, fully recognizable and unharmed, walks as a solemn guardian in black ceremonial armor at the head of a white horse carrying a black banner with a white five-petaled rose, a fallen crown on the ground, a bishop pleading in the distance, the sun rising between two towers. |
| `major-14.png` | Temperance | Tangttung stands peacefully at the edge of a pool wearing a white mantle with soft ceremonial wing-shaped ornaments that are not anatomical wings, one paw on a rock and one in shallow water, while water flows in a luminous arc between two golden cups floating beside the dog, yellow irises blooming and a glowing path leading to mountains. |
| `major-15.png` | The Devil | Tangttung embodies the shadow archetype while remaining recognizable, seated on a black pedestal in a dark cavern with elegant curved goat horns and a bat-wing mantle, an inverted pentagram glowing above the brow, two small human shadow figures below wearing loose chains that are visibly open and removable. |
| `major-16.png` | The Tower | Tangttung stands alert and unharmed on a rocky foreground as a tall stone tower behind is struck by a jagged lightning bolt, its golden crown blasted off, flames bursting from windows and two distant human silhouettes falling symbolically through the storm, sparks of golden fire raining down. |
| `major-17.png` | The Star | Tangttung kneels gracefully at the edge of a still pool under a night sky, one paw on land and one near the water, while two jugs beside the dog pour luminous streams, one onto land and one into the pool, one large radiant eight-pointed golden star surrounded by exactly seven smaller stars, a bird in a tree behind. |
| `major-18.png` | The Moon | Tangttung stands at the start of a winding moonlit path beside a dark pool, gazing upward at a full moon with a calm sleeping face dripping dew, two distant stone towers, one clearly distinct wolf howling on a ridge, a crayfish crawling from the pool toward the path. |
| `major-19.png` | The Sun | Tangttung gallops joyfully with open mouth and windblown shaggy coat beside a small white horse, a large red banner flowing from the horse's saddle, beneath a huge radiant sun with a serene face, a garden wall and exactly four tall sunflowers behind. |
| `major-20.png` | Judgement | Tangttung stands in the central foreground with head lifted as a mighty angel emerges from clouds blowing a golden trumpet with a banner, people rising from stone coffins on a sea with arms lifted in awe, icy mountains on the horizon. |
| `major-21.png` | The World | Tangttung leaps joyfully within a large oval laurel wreath bound with red ribbons, two small ceremonial wands floating symmetrically beside the dog, with four creatures in the corners among clouds: an angel, an eagle, a lion and a bull. |

### 지팡이 / Wands (14장)

| 파일명 | 카드 | Scene |
|---|---|---|
| `wands-01.png` | Ace of Wands | Tangttung stands in a green valley looking upward at a radiant hand emerging from a golden cloud and gripping one living wooden wand sprouting fresh leaves, a castle on a distant hill and a winding river below. |
| `wands-02.png` | Two of Wands | Tangttung stands on a castle battlement with one front paw resting on a small globe, one tall wand standing beside the dog and a second wand fixed to the wall, gazing over the sea toward distant mountains, exactly two wands visible. |
| `wands-03.png` | Three of Wands | Tangttung is seen from behind on a cliff top among exactly three planted wands, the long plumed tail and shaggy coat moving in the wind while golden ships sail across a calm amber sea. |
| `wands-04.png` | Four of Wands | Tangttung celebrates beneath exactly four tall wands supporting a garland canopy of flowers and fruit, two clearly distinct human celebrants raising bouquets nearby, a festive castle courtyard behind. |
| `wands-05.png` | Five of Wands | Tangttung moves playfully through the center of five young human celebrants in colorful tunics, each person holding one long wooden wand in a lively but harmless practice game, exactly five crossed wands under an open sky. |
| `wands-06.png` | Six of Wands | Tangttung leads a victory procession wearing a laurel wreath and green ceremonial cape, walking proudly beside a white horse, with a cheering crowd holding exactly six upright wands, one topped with a victory wreath. |
| `wands-07.png` | Seven of Wands | Tangttung stands determined on a high green ridge with one planted wand braced safely beside the front paws, facing exactly six other wands rising from below the edge, seven wands total. |
| `wands-08.png` | Eight of Wands | Tangttung runs through a green river valley while exactly eight sprouting wands fly in parallel across a clear sky overhead, a small house on a distant hill. |
| `wands-09.png` | Nine of Wands | Tangttung stands weary but unhurt with a small clean cloth bandage around one foreleg, leaning beside one wand and glancing warily sideways, exactly eight upright wands forming a fence behind, nine wands total. |
| `wands-10.png` | Ten of Wands | Tangttung trudges toward a town on the horizon carrying a heavy-looking but safely balanced bundle of exactly ten long wands secured across the back with a broad fabric strap, body leaning forward with determination. |
| `wands-11.png` | Page of Wands | Tangttung stands in a desert wearing an ornate page cape decorated with salamander patterns, one tall sprouting wand planted beside the dog, studying its glowing tip with curiosity, distant pyramids behind. |
| `wands-12.png` | Knight of Wands | Tangttung rides securely in a fitted ceremonial saddle on a rearing golden horse, wearing light canine armor and a flame-like orange plume, one sprouting wand mounted upright beside the saddle, desert dunes and pyramids behind. |
| `wands-13.png` | Queen of Wands | Tangttung sits warmly on a throne carved with lions and sunflowers, wearing a regal mantle, one large sunflower and one wand arranged upright on opposite sides, a black cat seated at the paws. |
| `wands-14.png` | King of Wands | Tangttung sits commandingly on a throne carved with salamanders and lions, wearing a flame-patterned royal robe, one tall flowering wand mounted beside the throne and a small salamander at its base. |

### 컵 / Cups (14장)

| 파일명 | 카드 | Scene |
|---|---|---|
| `cups-01.png` | Ace of Cups | Tangttung stands at a lotus pond beneath a radiant hand emerging from a golden cloud and holding one overflowing golden chalice, a white dove descending toward it, exactly five streams of water pouring into the pond. |
| `cups-02.png` | Two of Cups | Tangttung and one clearly distinct warm-golden companion dog face each other solemnly with two golden cups resting between their front paws, above them a winged lion head over a caduceus with two entwined serpents, a cottage on a hill behind. |
| `cups-03.png` | Three of Cups | Tangttung dances joyfully at the center of three women in flowing gowns who raise exactly three golden cups in a toast, autumn fruits and pumpkins at their feet. |
| `cups-04.png` | Four of Cups | Tangttung sits quietly under a tree on a hill with eyes half closed in contemplation, exactly three golden cups on the grass before the paws and a fourth cup offered by a small hand from a cloud. |
| `cups-05.png` | Five of Cups | Tangttung stands with head bowed in a long black cloak, exactly three golden cups spilled at the front paws and two upright cups behind, a river and stone bridge leading to a small castle. |
| `cups-06.png` | Six of Cups | Tangttung gently nudges one of exactly six golden cups, this cup filled with white star-shaped flowers, toward a small child in an old walled garden, with exactly five other flower-filled cups arranged around them and no additional cups, a quiet manor courtyard behind. |
| `cups-07.png` | Seven of Cups | Tangttung is seen from behind facing exactly seven golden cups floating on a great cloud, each holding one vision: a castle, jewels, a laurel wreath, a dragon, a glowing shrouded figure, a serene face and a serpent. |
| `cups-08.png` | Eight of Cups | Tangttung walks away up a rocky path toward dark mountains under an eclipsed moon with a face, wearing a simple travel cloak, leaving exactly eight neatly stacked golden cups behind. |
| `cups-09.png` | Nine of Cups | Tangttung sits contentedly on a cushioned bench with a proud but gentle expression, exactly nine golden cups arranged in a high arc on a draped table behind. |
| `cups-10.png` | Ten of Cups | Tangttung stands joyfully in the central foreground with a couple and two dancing children nearby, all looking toward a shining rainbow of exactly ten golden cups, a cozy cottage and river in a green valley. |
| `cups-11.png` | Page of Cups | Tangttung stands by the seashore wearing a whimsical floral page cape and soft beret, gazing curiously at one golden cup before the paws as a small fish pops out to look back. |
| `cups-12.png` | Knight of Cups | Tangttung rides securely on a calm white horse at a slow walk, wearing a winged canine helmet and graceful armor, one golden cup mounted steadily before the saddle, a river winding through the valley. |
| `cups-13.png` | Queen of Cups | Tangttung sits dreamily on an ornate shell-shaped throne at the water's edge, wearing a gentle queenly mantle and gazing at one magnificent closed golden chalice with angel-shaped handles, calm sea and cliffs behind. |
| `cups-14.png` | King of Cups | Tangttung sits composed on a stone throne that seems to float on a rolling sea, wearing a royal mantle, one golden cup and one lotus scepter mounted on opposite sides, a ship and leaping dolphin in the waves. |

### 검 / Swords (14장)

| 파일명 | 카드 | Scene |
|---|---|---|
| `swords-01.png` | Ace of Swords | Tangttung stands on a mountain ridge beneath a radiant hand emerging from a cloud and gripping one upright silver sword, its tip passing through a golden crown hung with a laurel and palm branch, jagged mountains below. |
| `swords-02.png` | Two of Swords | Tangttung sits calmly blindfolded with a soft white cloth on a stone bench before a rocky sea, exactly two long swords crossed symmetrically and planted safely behind the shoulders, a crescent moon in the sky. |
| `swords-03.png` | Three of Swords | Tangttung sits solemnly beneath a large glowing red heart pierced symbolically by exactly three straight silver swords, heavy gray storm clouds and slanting rain behind, with no wound or injury to the dog. |
| `swords-04.png` | Four of Swords | Tangttung sleeps peacefully on a raised stone resting place inside a chapel, exactly three swords hanging on the wall above and one sword carved along the side, a stained-glass window casting gentle light. |
| `swords-05.png` | Five of Swords | Tangttung stands alert on a windswept shore with exactly three swords gathered in a safe bundle beside the paws and two more lying on the ground, two dejected human figures walking away toward a choppy sea under jagged clouds. |
| `swords-06.png` | Six of Swords | Tangttung sits protectively beside a cloaked woman and child in a small wooden boat while a ferryman poles across calm gray water, exactly six swords standing upright in the bow, a far shore of low trees. |
| `swords-07.png` | Seven of Swords | Tangttung tiptoes away from a camp of colorful tents carrying exactly five swords secured safely in a broad bundle across the back and glancing behind, exactly two swords left standing in the ground, seven total. |
| `swords-08.png` | Eight of Swords | Tangttung stands blindfolded with a soft cloth and loosely encircled by a red ribbon, visibly able to step free, among exactly eight swords planted in marshy ground like a cage, a castle on a distant gray cliff. |
| `swords-09.png` | Nine of Swords | Tangttung sits in a natural anatomically supported canine pose in a dark bed, all four limbs correctly supported, head lowered toward the bedding with one front paw near the shaggy muzzle in a worried pose, exactly nine separate horizontal swords mounted in evenly spaced rows on the black wall above, a quilt decorated with roses and zodiac symbols. |
| `swords-10.png` | Ten of Swords | Tangttung rests safely on a desolate shore at dawn, head lowered but visibly unharmed, while exactly ten swords stand planted in the ground behind the dog in a dramatic fan, none touching the body, a pitch-black sky breaking into golden light over still water. |
| `swords-11.png` | Page of Swords | Tangttung stands alert on a windy hilltop wearing a light page cape, one upright sword planted safely beside the front paws, shaggy fur and fabric blown by the wind, scudding clouds and a flock of birds. |
| `swords-12.png` | Knight of Swords | Tangttung rides securely on a gray horse charging at full gallop, wearing fitted canine armor and a streaming cape and plume, one raised sword mounted firmly beside the saddle, wind-bent trees and ragged storm clouds. |
| `swords-13.png` | Queen of Swords | Tangttung sits sternly and wisely on a throne carved with butterflies and a winged cherub, wearing a clear regal mantle, one upright sword mounted beside the throne and one front paw extended in welcome, tall clear sky with a single bird. |
| `swords-14.png` | King of Swords | Tangttung sits resolutely facing forward on a stone throne carved with butterflies and crescent moons, wearing a structured royal mantle, one upright double-edged sword mounted centrally beside the throne, a still blue sky with two small birds. |

### 동전 / Pentacles (14장)

| 파일명 | 카드 | Scene |
|---|---|---|
| `pentacles-01.png` | Ace of Pentacles | Tangttung stands in a lush garden beneath a radiant hand emerging from a golden cloud and holding one large golden pentacle engraved with a five-pointed star, a flowering hedge archway opening to distant mountains. |
| `pentacles-02.png` | Two of Pentacles | Tangttung dances lightly on the shore while exactly two golden pentacles float and circle above the front paws, connected by one green infinity-shaped ribbon, two ships riding huge waves behind. |
| `pentacles-03.png` | Three of Pentacles | Tangttung stands proudly on a low bench inside a cathedral archway wearing a small artisan apron, placing one paw beside a fresh carving while a human stonemason, a monk and a hooded architect consult plans, exactly three pentacles carved into the arch above. |
| `pentacles-04.png` | Four of Pentacles | Tangttung sits on a stone bench wearing a restrained crown, one golden pentacle resting against the chest in a soft fabric sling, one balanced above the crown and one beneath each front paw, exactly four pentacles, a city skyline behind. |
| `pentacles-05.png` | Five of Pentacles | Tangttung walks protectively beside one ragged human traveler on crutches through falling snow, passing beneath a glowing stained-glass church window containing exactly five golden pentacles arranged like a tree. |
| `pentacles-06.png` | Six of Pentacles | Tangttung sits like a generous merchant in a rich red mantle, golden balance scales floating beside one shoulder, with exactly six golden pentacle coins total in the entire image, some of those six falling into the hands of two kneeling human figures and the others arranged clearly around Tangttung, no additional coins or pentacles. |
| `pentacles-07.png` | Seven of Pentacles | Tangttung rests thoughtfully beside a hoe in a cultivated garden, gazing at a lush green vine on which exactly seven golden pentacles grow like fruit. |
| `pentacles-08.png` | Eight of Pentacles | Tangttung sits attentively beside a craftsman's bench, one unfinished golden pentacle under a careful paw near a small chisel, exactly six finished pentacles displayed on a post and one additional finished pentacle at the paws, eight total, a town on the horizon. |
| `pentacles-09.png` | Nine of Pentacles | Tangttung stands elegantly in a ripe vineyard wearing a flowing gold-patterned mantle, a hooded falcon perched on a low stand beside the dog, exactly nine golden pentacles nestled clearly among the vines, a manor behind. |
| `pentacles-10.png` | Ten of Pentacles | Tangttung sits as the white-shaggy elder guardian beneath a stone archway with two clearly distinct smaller dogs nearby, a young human couple and child in the market square beyond, exactly ten golden pentacles arranged across the scene like a tree of life. |
| `pentacles-11.png` | Page of Pentacles | Tangttung stands alone in a flowering meadow wearing a simple page cape, gazing intently at one golden pentacle floating just above the front paws, a plowed field and small grove behind. |
| `pentacles-12.png` | Knight of Pentacles | Tangttung sits securely and motionless on a heavy black draft horse, wearing patient knightly armor, one golden pentacle mounted before the saddle, neatly plowed brown fields behind. |
| `pentacles-13.png` | Queen of Pentacles | Tangttung sits nurturingly on a throne carved with goats, fruit and angels, wearing a soft queenly mantle with one golden pentacle resting in the lap area, a small rabbit at the corner and an arbor of red roses overhead. |
| `pentacles-14.png` | King of Pentacles | Tangttung sits prosperously on a throne carved with bulls, wearing a dark robe embroidered with grape vines, one front paw resting beside a golden pentacle and a scepter mounted on the other side, a castle behind a stone wall. |

---

## 7. 전용 카드 뒷면 (1장)

`back.png`에도 탕뚱 사진 10장을 모두 레퍼런스로 첨부한다. 정면 얼굴을 그대로 넣으면 상하 반전 시
방향성이 생기므로, 탕뚱의 귀·주둥이·풍성한 털 실루엣을 추상화한 두 개의 수호견 프로필을 180도
회전 대칭으로 배치한다.

| 파일명 | Scene |
|---|---|
| `back.png` | A perfectly symmetric ornamental tarot card back design inspired by Tangttung: two abstract ivory-white shaggy Korean Sapsaree guardian profiles derived from the supplied photographs, mirrored top-to-bottom and left-to-right around one large radiant gold eight-pointed star at the center of a deep midnight-indigo field, surrounded by concentric rings of small stars, crescent moons, protective gate motifs and fine gold filigree, with no realistic upright face and no directional cue, so the card looks identical after a 180-degree rotation. |

`back.png` 프롬프트에는 §4.1 `STYLE_PREFIX`와 아래 전용 규칙을 사용하고, 앞면용
`TANGTTUNG_IDENTITY_BLOCK` 및 `CANINE_TAROT_RULES`는 사용하지 않는다.

최종 조립 순서는 `STYLE_PREFIX` → 아래 `BACK_RULES` → `Scene:` → 위 표의 `back.png` Scene이다.

```text
Use all ten supplied Tangttung photographs together only to derive the distinctive
shaggy ear, muzzle and coat silhouette. The design must be mathematically balanced
and visually identical after a 180-degree rotation. No text, letters, numbers,
logo, signature or watermark.
```

---

## 8. 생성 순서와 승인 게이트

### 단계 A - 입력 사전 점검

1. 사진 10개가 모두 존재하고 읽히는지 확인한다.
2. `public/decks/tangttung/`을 생성한다.
3. 기존 스타일 레퍼런스 `public/decks/starot/major-00.png`의 존재 여부를 확인한다.
4. 사진 10개의 역할을 생성 로그에 기록한다.

### 단계 B - 파일럿 6장

아래 6장을 먼저 생성한다.

1. `major-00.png` - 얼굴·전신·장모 정체성과 전체 화풍
2. `major-02.png` - 정면 얼굴, 차분한 표정, 대칭 구도
3. `cups-02.png` - 탕뚱과 조연의 구분, 개체 복제 방지
4. `swords-09.png` - 감정 표현, 정확히 9개의 검
5. `pentacles-10.png` - 복잡한 장면, 정확히 10개의 펜타클
6. `back.png` - 180도 회전 대칭

파일럿 전부가 §10 체크리스트를 통과해야 나머지 73장을 생성한다. 실패 시 고정 프롬프트를 바꾸지
말고 동일 프롬프트로 재시도한다. 파일럿 단계에서만 고정 블록 자체의 구조적 결함을 수정할 수 있으며,
수정했다면 이미 통과한 파일럿도 전부 새 블록으로 다시 생성한다.

### 단계 C - 나머지 카드

1. 메이저 아르카나 나머지 20장 (`major-00`, `major-02` 제외)
2. Wands 14장
3. Cups 나머지 13장 (`cups-02` 제외)
4. Swords 나머지 13장 (`swords-09` 제외)
5. Pentacles 나머지 13장 (`pentacles-10` 제외)

합계는 73장이다. 파일럿 6장과 합치면 총 79장이 된다.

각 슈트가 끝날 때마다 슈트 접촉시트를 만들고 개체 정체성, 상징물 개수, 색조를 확인한다.

### 단계 D - 실패 재생성 루프

- 누락, 손상, 해상도, 개체 정체성, 해부학, 텍스트, 상징물 개수, 스타일 중 하나라도 실패하면 해당
  카드만 같은 프롬프트와 같은 10장 레퍼런스로 재생성한다.
- 한 카드가 3회 연속 실패하면 실패 사유와 시도 이미지를 기록하고 다음 카드로 진행한 뒤 마지막에
  다시 처리한다.
- 최종 종료 조건은 **79/79 자동 검증 통과 + 79/79 육안 검증 통과**다.

---

## 9. 자동 검증 스크립트

리포 루트에서 실행한다. 정확한 파일명, 파일 수, 최소 용량, PNG 형식, 1024 x 1536 해상도를 검사한다.

```bash
#!/bin/bash
# verify-tangttung-cards.sh
set -u

DIR="public/decks/tangttung"
FAIL=0
EXPECTED=()

for i in $(seq 0 21); do
  EXPECTED+=("major-$(printf '%02d' "$i").png")
done

for suit in wands cups swords pentacles; do
  for rank in $(seq 1 14); do
    EXPECTED+=("${suit}-$(printf '%02d' "$rank").png")
  done
done

EXPECTED+=("back.png")

echo "기대 파일 수: ${#EXPECTED[@]} (79여야 함)"

for f in "${EXPECTED[@]}"; do
  p="$DIR/$f"

  if [ ! -f "$p" ]; then
    echo "MISSING: $f"
    FAIL=1
    continue
  fi

  size=$(stat -f%z "$p" 2>/dev/null || stat -c%s "$p")
  if [ "$size" -lt 10000 ]; then
    echo "TOO_SMALL(${size}B): $f"
    FAIL=1
    continue
  fi

  format=$(sips -g format "$p" 2>/dev/null | awk '/format:/{print $2}')
  if [ "$format" != "png" ]; then
    echo "WRONG_FORMAT(${format:-unknown}): $f"
    FAIL=1
  fi

  dims=$(sips -g pixelWidth -g pixelHeight "$p" 2>/dev/null \
    | awk '/pixelWidth:/{w=$2} /pixelHeight:/{h=$2} END{print w "x" h}')
  if [ "$dims" != "1024x1536" ]; then
    echo "WRONG_SIZE(${dims:-unknown}): $f"
    FAIL=1
  fi
done

actual=$(find "$DIR" -maxdepth 1 -type f -name '*.png' | wc -l | tr -d ' ')
echo "실제 PNG 파일 수: $actual"

if [ "$actual" -ne 79 ]; then
  echo "COUNT_MISMATCH"
  FAIL=1
fi

if [ "$FAIL" -eq 0 ]; then
  echo "ALL 79 TANGTTUNG CARDS PASSED"
else
  echo "FAILED - 위 파일을 재생성해야 함"
fi

exit "$FAIL"
```

---

## 10. 육안 검증 체크리스트

### 탕뚱 개체 정체성

- [ ] 사진 10장을 모두 레퍼런스로 사용했는가
- [ ] 79장 모두 같은 탕뚱으로 보이는가
- [ ] 아이보리·크림색의 풍성한 중장모 털이 유지되는가
- [ ] 늘어진 회베이지색 귀, 둥글고 순한 짙은 갈색 눈, 넓고 윤기 있는 검은 코가 유지되는가
- [ ] 긴 직사각형 주둥이와 풍성한 수염, 긴 다리, 큰 발, 길고 풍성한 꼬리가 유지되는가
- [ ] 눈이 앞머리 사이로 일부 보여 표정이 읽히는가
- [ ] 올드 잉글리시 시프도그, 푸들, 테리어 또는 일반 흰 개처럼 변하지 않았는가
- [ ] 사진 속 하네스, 리드줄, 목줄, 스카프, 실내 배경이 의도 없이 복제되지 않았는가

### 개 해부학과 동물 안전

- [ ] 사람 손·팔·손가락·발이 탕뚱 몸에 생기지 않았는가
- [ ] 보이는 범위에서 다리, 귀, 눈, 코, 발, 꼬리 개수가 정상인가
- [ ] 중복 얼굴, 중복 꼬리, 합쳐진 발, 부러진 관절이 없는가
- [ ] 의상과 갑옷이 네발 체형에 자연스럽게 맞는가
- [ ] 검, 사슬, 추락, 죽음 장면이 비유적이며 탕뚱이 다치거나 고통받지 않는가
- [ ] 조연 동물이 탕뚱의 복제처럼 보이지 않는가

### 타로 상징과 장면

- [ ] 카드의 원래 의미와 핵심 구도가 식별되는가
- [ ] 숫자 카드의 지팡이·컵·검·펜타클 개수가 정확한가
- [ ] 에이스와 코트 카드의 핵심 상징물이 빠지지 않았는가
- [ ] 위험을 피하려다 카드의 의미 자체가 사라지지 않았는가

### 통일 화풍

- [ ] 전 카드가 동일한 금색 이중선 테두리와 네 모서리 별 장식을 갖는가
- [ ] 미드나잇 인디고·바이올렛 배경, 금색·호박색 광원, 아이보리 털 팔레트가 일관적인가
- [ ] 선 굵기, 수채·플랫 채색, 광원의 온도가 덱 전체에서 일관적인가
- [ ] 이미지 안에 글자, 숫자, 카드명, 서명, 로고, 워터마크가 없는가
- [ ] `back.png`가 180도 회전해도 같은 디자인으로 보이는가

### 권장 검수 접촉시트

- 전체 79장 8열 접촉시트
- 메이저 22장 접촉시트
- 슈트별 14장 접촉시트 4개
- 탕뚱 원본 사진 10장과 파일럿 5장 얼굴을 나란히 둔 정체성 비교 시트
- `back.png` 원본과 180도 회전본의 반투명 오버레이

---

## 11. 재생성 사유 분류

| 코드 | 사유 | 예시 |
|---|---|---|
| `ID` | 탕뚱 정체성 불일치 | 귀 색이 사라짐, 코가 작아짐, 다른 견종처럼 보임 |
| `REF` | 사진 10장 입력 누락 | 일부 사진만 첨부됨 |
| `ANATOMY` | 개 해부학 오류 | 사람 손, 다섯 번째 다리, 꼬리 중복 |
| `COUNT` | 상징물 개수 오류 | `swords-09`에 검 8개, `pentacles-10`에 9개 |
| `SCENE` | 카드 의미 또는 핵심 소품 누락 | Justice의 저울 누락 |
| `STYLE` | 테두리·팔레트·화풍 불일치 | 밝은 흰 배경, 다른 테두리 |
| `TEXT` | 문자 아티팩트 | 카드명, 숫자, 서명, 워터마크 |
| `SAFETY` | 불필요한 동물 위해 표현 | 몸을 찌르는 검, 상처, 고통 표정 |
| `FILE` | 파일 검증 실패 | 누락, 손상, 잘못된 해상도 또는 포맷 |

---

## 12. 완료 리포트 양식

```text
- 생성 완료: NN / 79
- 앞면 생성: NN / 78
- 전용 뒷면 생성: 0 또는 1 / 1
- 사용 모델: GPT Image 2.0
- 해상도·포맷: 1024 x 1536 PNG
- 레퍼런스 입력: 탕뚱 사진 10장 전 호출 사용 여부
- 스타일 앵커: public/decks/tangttung/major-00.png 사용 여부
- 재생성한 카드와 사유: 파일명, 사유 코드, 횟수
- 자동 검증: ALL 79 TANGTTUNG CARDS PASSED 여부
- 탕뚱 정체성 검수: 통과 / 미해결 카드
- 타로 상징·개수 검수: 통과 / 미해결 카드
- 해부학·동물 안전 검수: 통과 / 미해결 카드
- 스타일 검수: 통과 / 미해결 카드
- 미해결 이슈: 있다면 구체적으로 기록
```

완료 보고 전에는 생성 파일 수만 확인하지 말고, 사진 10장 기반의 동일 개체성, 타로 상징물 개수,
개 해부학, 동물 안전, 텍스트 부재, 덱 전체 화풍을 모두 확인한다.
