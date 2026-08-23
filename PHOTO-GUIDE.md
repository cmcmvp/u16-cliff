# 照片替换清单 · Photo Drop-in Guide

## ✅ 当前状态（已完成）

**16 张照片已全部就位并优化完成**：

- 14 张游戏场景照片 → `assets/images/scenes/`
- 2 张页面主图（`rink-hero.jpg`、`community.jpg`）→ `assets/images/`
- 已统一裁成 **16:9**（场景）与 **横幅比例**（页面主图），并压缩：**33 MB → 3.5 MB（减小 89%）**
- 原始高清图已备份到项目外的 `_photo-originals/`（不会被上传到 GitHub）

### ⚠️ 还剩两件事

1. **`cliff.jpg` 和 `contact.jpg` 目前是同一张图**（内容完全相同）。这两幕在游戏里前后出现，建议给 `contact.jpg` 换一张"身体对抗/撞击"的照片：
   <https://www.pexels.com/search/ice%20hockey%20game/>
2. **受访者照片还没有**：`interviewee-1.jpg` ~ `interviewee-4.jpg` 放进 `assets/images/`（建议用你自己受访者的真实照片，需征得同意）。没有时页面显示灰色占位框，不影响整体。

> 以后想再换任何一张：**同名覆盖即可，代码不用动**。换完记得用 [TinyPNG](https://tinypng.com/) 压一下，或者告诉我，我帮你批量处理。

---

## 附：原始下载清单（备查）

如果需要重新下载或替换某一张，下面是原始来源。**不需要改任何代码**——按表中命名覆盖同名文件即可。

图片来源全部是 **Pexels**（[Pexels 许可](https://www.pexels.com/license/)：**免费商用、无需署名**）。
下载方法：点开链接 → 右上角 **Free Download** → 尺寸选 **Large（约 1920px）**。

---

## 一、页面主图（4 张，优先做这几张效果最明显）

放进 `assets/images/`

| 命名 | 用在哪 | 建议内容 | 下载链接 |
|---|---|---|---|
| `rink-hero.jpg` | Timeline 页顶部大图 | 冰球场全景 / 球员滑行 | https://www.pexels.com/photo/a-hockey-player-skating-on-ice-rink-8975011/ |
| `community.jpg` | Proposal 页 Practice 4 | 孩子们打球 / 团队 | https://www.pexels.com/photo/photo-of-kids-playing-hockey-1752502/ |
| `cliff-chart.jpg` | 首页图 1 | ⚠️ **别换**，这是数据图 | — |
| `pathway-compare.jpg` / `pyramid.jpg` | U16 页图 2、图 3 | ⚠️ **别换**，这是示意图 | — |

> 数据图和示意图请保留 SVG——换成照片会丢掉信息。

---

## 二、游戏场景照片（14 张，可选，换几张就有效果）

放进 `assets/images/scenes/`，命名必须完全一致（`.jpg` 会自动覆盖同名 `.svg`）

| 命名 | 对应剧情 | 建议内容 | 下载链接 |
|---|---|---|---|
| `glass.jpg` | 开场 · 隔着玻璃看冰场 | 冰场/看台视角 | https://www.pexels.com/photo/people-playing-ice-hockey-on-ice-rink-8974835/ |
| `birth.jpg` | Round 0 · 出生 | 医院走廊 / 婴儿脚印（抽象即可） | https://www.pexels.com/search/hospital%20corridor/ |
| `money.jpg` | 装备与账单 | 冰球装备 / 球杆冰刀特写 | https://www.pexels.com/search/hockey%20equipment/ |
| `drill.jpg` | 清晨训练 | 训练、锥桶、冲刺 | https://www.pexels.com/photo/a-boy-playing-ice-hockey-12955702/ |
| `classroom.jpg` | 学业冲突 / 中考 | 教室 / 书桌 / 试卷 | https://www.pexels.com/search/classroom%20desk/ |
| `contact.jpg` | 身体对抗合法化 | 冰球对抗、撞击 | https://www.pexels.com/search/ice%20hockey%20game/ |
| `lonely.jpg` | 小圈子 · 空看台 | 空冰场 / 一个人 | https://www.pexels.com/search/empty%20ice%20rink/ |
| `cliff.jpg` | **U16 悬崖**（最关键一张） | 孤独站在冰上 / 冷峻氛围 | https://www.pexels.com/photo/young-child-on-ice-rink-wearing-oversized-hockey-jersey-33364327/ |
| `closeddoor.jpg` | 封闭训练 | 队列训练 / 教练训话 | https://www.pexels.com/photo/a-hockey-coach-explaining-on-a-coaching-board-8973434/ |
| `airport.jpg` | 留洋 | 机场 / 行李 / 飞机 | https://www.pexels.com/search/airport%20departure/ |
| `lockerroom.jpg` | 文化冲击 · 更衣室 | 更衣室围圈讨论 | https://www.pexels.com/photo/a-hockey-team-talking-in-the-locker-room-6847581/ |
| `draft.jpg` | 选秀之夜 | 比赛高光 / 球场灯光 | https://www.pexels.com/photo/hockey-players-entering-on-ice-rink-6468586/ |
| `graduation.jpg` | 学业+冰球双成 | 毕业 / 学位帽 | https://www.pexels.com/search/graduation/ |
| `faded.jpg` | 离开的人 | 空冰场 / 背影 / 旧装备 | https://www.pexels.com/search/hockey%20stick%20alone/ |

---

## 三、受访者照片（Outlook 页）

放进 `assets/images/`：`interviewee-1.jpg` ~ `interviewee-4.jpg`

**建议用你自己受访者的真实照片**（需征得同意）。用陌生人的网图当受访者会误导读者。
没有照片时页面会显示灰色占位框，不影响整体。

---

## 四、访谈视频

放进 `assets/videos/`，页面上已标明每个位置要什么文件名：

`interview-us.mp4` · `interview-jp.mp4` · `interview-cn-circle.mp4` ·
`interview-ca.mp4` · `interview-cn-closeddoor.mp4` · `interview-abroad.mp4` · `interview-coaching.mp4`

单个文件务必压到 **100MB 以内**（GitHub 硬限制）。压缩命令：

```bash
ffmpeg -i 原视频.mp4 -vf "scale=-2:720" -c:v libx264 -crf 26 -preset slow \
       -c:a aac -b:a 128k -movflags +faststart 输出.mp4
```

压不下来就传 B 站 / YouTube，用 iframe 嵌入。

---

## 五、两个小提示

1. **务必压缩**：单张照片压到 300–800KB，网页才快。用 [TinyPNG](https://tinypng.com/) 免费压，拖进去下载即可。
2. **命名区分大小写**：GitHub 上 `Cliff.jpg` ≠ `cliff.jpg`，务必全小写。

---

## 更多图源

- Pexels：[ice hockey](https://www.pexels.com/search/ice%20hockey/) · [youth hockey](https://www.pexels.com/search/youth%20hockey/) · [hockey room](https://www.pexels.com/search/hockey%20room/)
- Unsplash：[ice hockey](https://unsplash.com/s/photos/ice-hockey)（同样免费商用免署名）
- 中国 / 北京冬奥真实图（CC 协议，**需在图注注明作者**）：[Wikimedia Commons · Ice hockey in China](https://commons.wikimedia.org/wiki/Category:Ice_hockey_in_China)
