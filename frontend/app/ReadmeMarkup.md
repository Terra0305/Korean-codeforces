# Supported Markup Syntax for Problem Descriptions

This system uses **Markdown** with extensions for **Math (LaTeX)** and **GitHub Flavored Markdown (GFM)**.

## 1. Headers
Use `#` for headers.
```markdown
# Header 1
## Header 2
### Header 3
```

## 2. Emphasis
```markdown
*Italic* or _Italic_
**Bold** or __Bold__
***Bold and Italic***
```

## 3. Lists
Unordered:
```markdown
- Item 1
- Item 2
  - Subitem
```
Ordered:
```markdown
1. First
2. Second
```

## 4. Links and Images
```markdown
[Link Text](URL)
![Image Alt Text](Image URL)
```

## 5. Input / Output Boxes (Code Blocks)
Use triple backticks for input/output examples. This will create a box with monospaced font.
```markdown
### Input
```text
5
1 2 3 4 5
```

### Output
```text
15
```
```

## 6. Math (LaTeX)
Use `$` for inline math and `$$` for block math.
Inline: $a^2 + b^2 = c^2$
Block:
$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

## 7. Tables (GFM)
```markdown
| Header 1 | Header 2 |
| :------- | :------- |
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
```

## 8. Blockquotes
```markdown
> This is a quote.
```

## 9. Horizontal Rule
```markdown
---
```
