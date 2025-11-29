# Markdown 格式演示 📝

本页面展示了本 Wiki 支持的所有 Markdown 格式和扩展语法。

## 基础文本格式

### 强调

- **粗体文本** 使用 `**文字**`
- *斜体文本* 使用 `*文字*`
- ***粗斜体*** 使用 `***文字***`
- ~~删除线~~ 使用 `~~文字~~`
- ==高亮文本== 使用 `==文字==`（如果支持）

### 引用

> 这是一段引用文字。
> 
> 引用可以有多个段落。
> 
> > 还可以嵌套引用。

## 列表

### 无序列表

- 苹果
- 香蕉
  - 小香蕉
  - 大香蕉
- 橙子

### 有序列表

1. 第一步：打开电脑
2. 第二步：打开浏览器
3. 第三步：访问 Wiki
   1. 子步骤 A
   2. 子步骤 B

### 任务列表 ✅

- [x] 已完成的任务
- [x] 这个也完成了
- [ ] 待完成的任务
- [ ] 还没做的事情

## 代码

### 行内代码

使用 `console.log('Hello World')` 打印输出。

### 代码块

```javascript
// JavaScript 示例
function greet(name) {
  console.log(`Hello, ${name}!`);
  return `Welcome to USC Wiki`;
}

greet('同学');
```

```python
# Python 示例
def calculate_gpa(courses):
    """计算 GPA"""
    total_credit = sum(c['credit'] for c in courses)
    total_point = sum(c['credit'] * c['point'] for c in courses)
    return total_point / total_credit if total_credit > 0 else 0

courses = [
    {'name': '高等数学', 'credit': 5, 'point': 4.0},
    {'name': '大学英语', 'credit': 3, 'point': 3.5},
]
print(f"GPA: {calculate_gpa(courses):.2f}")
```

```css
/* CSS 示例 */
.modern-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.modern-card:hover {
  transform: translateY(-4px);
}
```

```bash
# Shell 命令示例
npm install vitepress
npm run docs:dev
```

## 链接和图片

### 链接

- [外部链接：GitHub](https://github.com)
- [内部链接：首页](/)
- [内部链接：GPA 政策](/academics/gpa)
- [锚点链接：跳转到表格](#表格)

### 图片

![VitePress Logo](https://vitepress.dev/vitepress-logo-large.webp)

## 表格

| 课程名称 | 学分 | 成绩 | 绩点 |
| :--- | :---: | :---: | ---: |
| 高等数学 | 5.0 | 92 | 4.0 |
| 大学英语 | 3.0 | 85 | 3.5 |
| 数据结构 | 4.0 | 88 | 3.7 |
| 计算机网络 | 3.5 | 90 | 4.0 |

> 表格支持左对齐 `:---`、居中 `:---:`、右对齐 `---:`

## 数学公式 📐

### 行内公式

勾股定理：$a^2 + b^2 = c^2$

圆的面积：$S = \pi r^2$

### 块级公式

二次方程求根公式：

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

GPA 计算公式：

$$
GPA = \frac{\sum_{i=1}^{n} (学分_i \times 绩点_i)}{\sum_{i=1}^{n} 学分_i}
$$

矩阵示例：

$$
\begin{pmatrix}
1 & 2 & 3 \\
4 & 5 & 6 \\
7 & 8 & 9
\end{pmatrix}
$$

## 脚注 📌

这是一个带脚注的句子[^1]。

另一个脚注示例[^2]。

[^1]: 这是第一个脚注的内容，会显示在页面底部。
[^2]: 脚注可以包含更详细的解释或引用来源。

## VitePress 提示框

::: info 信息
这是一条普通的信息提示。
:::

::: tip
这是一个有用的小技巧！
:::

::: warning 警告
请注意这个潜在的问题。
:::

::: danger 危险
这是一个危险操作，请谨慎！
:::

::: details 点击展开详情
这里是被折叠的内容。

可以包含：
- 列表
- **格式化文本**
- `代码`

```js
// 甚至可以包含代码块
console.log('展开查看');
```
:::

## 分隔线

上面的内容

---

下面的内容

## Emoji 表情 🎉

支持直接使用 Emoji：

- 🎓 学习
- 📚 书本
- 💻 编程
- 🍜 美食
- 🚀 火箭
- ✅ 完成
- ❌ 错误
- ⚠️ 警告

## 键盘按键

按下 <kbd>Ctrl</kbd> + <kbd>C</kbd> 复制

按下 <kbd>Ctrl</kbd> + <kbd>V</kbd> 粘贴

按下 <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> 打开命令面板

## HTML 内联支持

<details>
<summary>使用原生 HTML 折叠</summary>

这是折叠的内容，使用了 HTML 的 `<details>` 和 `<summary>` 标签。

</details>

<mark>使用 mark 标签高亮文本</mark>

<sup>上标文本</sup> 和 <sub>下标文本</sub>

## 自定义 Vue 组件

### GPA 计算器

<GPACalculator />

### 倒计时

<Countdown targetDate="2025-12-31" eventName="元旦" />

---

## 总结

本页面涵盖了以下 Markdown 功能：

| 功能 | 语法 | 状态 |
| :--- | :--- | :---: |
| 基础格式 | `**粗体**` `*斜体*` | ✅ |
| 列表 | `-` `1.` | ✅ |
| 任务列表 | `- [x]` `- [ ]` | ✅ |
| 代码块 | ` ``` ` | ✅ |
| 表格 | `\| \|` | ✅ |
| 数学公式 | `$` `$$` | ✅ |
| 脚注 | `[^1]` | ✅ |
| 提示框 | `::: tip` | ✅ |
| Vue 组件 | `<Component />` | ✅ |
