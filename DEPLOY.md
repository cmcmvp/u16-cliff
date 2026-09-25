# 上线操作步骤 · Deployment Guide

> **为什么我不能替你点这几步**：上线需要登录你的 GitHub 账号并授权。
> 我没有你的账号，也不能代你注册或输入密码——这类操作必须由你本人完成。
> 但下面每一步都写到了"点哪个按钮"，跟着做大约 **10 分钟**。

---

## 第 0 步：先在本地确认（5 分钟）

上线前一定先本地看一遍，避免把问题发布出去。

1. 用 **VS Code** 打开 `hockey-research-en` 文件夹。
2. 右键 `index.html` → **Open with Live Server**（没装就在扩展里搜 Live Server 安装）。
3. 逐项检查：

- [ ] 八个页面导航都能点开
- [ ] **Interviews 页**：8 个视频封面都显示，点击能播放
- [ ] **Why They Stop at Sixteen 页**：Jiayi Liu 的视频出现在 "Deep level" 那一节
- [ ] **Career Simulator**：点 "Enter the simulation" 能进全屏，照片背景正常
- [ ] 图表条形在滚动到时会生长
- [ ] 手机尺寸下（浏览器窄窗口）导航变成 ☰ 汉堡菜单

> ⚠️ **不要直接双击 html 文件打开**（`file://` 方式），YouTube 嵌入在那种模式下可能被拦。一定用 Live Server。

---

## 第 1 步：注册 / 登录 GitHub（首次约 3 分钟）

1. 打开 <https://github.com>
2. 没账号点 **Sign up** 注册（需要邮箱验证）；有账号直接 **Sign in**

---

## 第 2 步：新建仓库（1 分钟）

1. 登录后点右上角 **＋** → **New repository**
2. 填写：
   - **Repository name**：`on-the-thin-ice`（或你喜欢的名字，建议全小写、用连字符）
   - **Public** ← 必须选 Public，Pages 免费版才能公开访问
   - 下面的 "Add a README" **不要勾**
3. 点 **Create repository**

---

## 第 3 步：上传文件（3 分钟，两种方式选一个）

### 方式 A：网页拖拽（推荐，不用命令行）

1. 在刚建好的仓库页面，点 **uploading an existing file**
   （或者 **Add file** → **Upload files**）
2. 打开你电脑上的 `hockey-research-en` 文件夹，**全选里面的所有内容**
   （`index.html`、其他 html、`css`、`js`、`assets` 等）
   > ⚠️ 关键：拖 **文件夹里面的内容**，不要拖 `hockey-research-en` 这个文件夹本身。
   > 否则网址会变成 `.../hockey-research-en/index.html`，多一层。
3. 拖进浏览器窗口，等进度条走完（约 4MB，很快）
4. 下方 **Commit changes** 按钮 → 点击

### 方式 B：Git 命令行

```bash
cd "D:\OneDrive\学习资料\软件\网页\刘逸舟\hockey-research-en"
git init
git add .
git commit -m "On the Thin ice website"
git branch -M main
git remote add origin https://github.com/你的用户名/on-the-thin-ice.git
git push -u origin main
```

---

## 第 4 步：开启 GitHub Pages（1 分钟）

1. 仓库页面顶部点 **Settings**（齿轮图标）
2. 左侧菜单找到 **Pages**
3. **Source** 选 **Deploy from a branch**
4. **Branch** 选 **main**，右边文件夹选 **/ (root)**
5. 点 **Save**

等 **1–3 分钟**，刷新这个页面，上方会出现绿色提示和你的网址：

```
https://你的用户名.github.io/on-the-thin-ice/
```

**这个网址任何人都能打开**，微信、邮件里发都行。

---

## 第 5 步：上线后再确认一遍

打开你的网址，重点看：

- [ ] 首页样式正常（不是纯白无格式 → 若是，说明路径大小写有问题，见下方 FAQ）
- [ ] Interviews 页 8 个视频能播
- [ ] Career Simulator 能进全屏
- [ ] 用**手机**打开也正常

---

## 以后怎么更新

改完文件后：

- **方式 A（网页）**：仓库 → **Add file** → **Upload files** → 拖入改动过的文件 → Commit
- **方式 B（命令行）**：
  ```bash
  git add .
  git commit -m "更新内容"
  git push
  ```

推送后 **1–2 分钟**网站自动更新。

---

## 备选：Netlify 拖拽上线（最快，30 秒，不用 Git）

如果你只想先给人看看效果：

1. 打开 <https://app.netlify.com/drop>
2. 把 `hockey-research-en` **整个文件夹**拖进去
3. 立刻得到一个公开网址

想长期保留就用 GitHub 登录注册个免费账号。Netlify 免费版不限流量，比 GitHub Pages 宽松。

---

## 自定义域名（可选）

有自己的域名的话：

1. 仓库 **Settings → Pages → Custom domain**，填入域名，Save
2. 到域名服务商那里加 DNS 记录：
   - 用 `www.你的域名.com`：加一条 **CNAME** 指向 `你的用户名.github.io`
   - 用根域名 `你的域名.com`：加 4 条 **A** 记录指向
     `185.199.108.153`、`185.199.109.153`、`185.199.110.153`、`185.199.111.153`
3. 回到 Pages 页面勾上 **Enforce HTTPS**（可能要等几十分钟证书签发）

---

## 常见问题 FAQ

**Q：网站打开是纯文字、没有样式和图？**
路径大小写问题。GitHub 区分大小写：`Style.css` ≠ `style.css`。检查文件名是否全小写，且与 HTML 里写的完全一致。

**Q：视频显示不出来 / 一片空白？**
1. 确认视频在 YouTube 上的隐私设置是 **Public** 或 **Unlisted**，不能是 Private。
2. 中国大陆访问 YouTube 需要梯子——这是网络环境问题，不是网站问题。若主要给国内看，把视频同时传一份到 B 站，我可以帮你把播放器换成 B 站。

**Q：网址打开是 404？**
- 确认首页文件名是 `index.html`（全小写）
- 确认 Pages 的 Branch 选的是 `main`、文件夹是 `/ (root)`
- 刚开启 Pages 需要等 1–3 分钟

**Q：图片加载慢？**
照片已压缩到 3.5MB 总量，正常很快。若仍慢，多半是首次访问，刷新即可。

**Q：`_photo-originals` 文件夹要上传吗？**
**不要**。那是 34MB 的原始高清备份，在项目文件夹外面，不会被上传，留在你电脑上就好。

---

## 上线前最后检查清单

- [ ] 把 `index.html` 里的 `Author Name` / `Institution` 换成真实姓名和机构
- [ ] `js/interviews.js` 里补上每位受访者的 `role` / `country` / `summary`
- [ ] `interviews.html` 里的 YouTube 频道链接换成你的频道
- [ ] `outlook.html` 里的 BibTeX 作者名
- [ ] 三所美国学院（Cushing / Lovell / Lawrence）的超链接（`u16-cliff.html` 里搜 `data-link="academy"`）
- [ ] 受访者照片 `interviewee-1.jpg` ~ `interviewee-4.jpg`（可选）
- [ ] `contact.jpg` 换一张（目前和 `cliff.jpg` 是同一张）
