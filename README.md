# cref

コメントに書いたパスへ即ジャンプする VS Code 拡張。

```ruby
# @spec/models/user_spec.rb
```

このコメントを書いておくだけで、`Ctrl+Shift+T` でそのファイルへ飛べます。


## 使い方

ファイルの先頭付近に `# @<パス>` 形式のコメントを書くだけ。

```ruby
# @spec/models/user_spec.rb

class User
  ...
```

```javascript
// @src/__tests__/utils.test.js

export function formatDate(date) {
  ...
```

パスはワークスペースルートからの相対パスで指定します。


## キーバインド

| OS | ショートカット |
|----|--------------|
| Windows / Linux | `Ctrl+Shift+T` |
| macOS | `Cmd+Shift+T` |


## 対応コメント形式

言語を問わず、行頭が `#` `//` `/*` などのコメントであれば認識します。

```ruby
# @path/to/file.rb
```
```javascript
// @path/to/file.js
```
```python
# @path/to/test.py
```

## インストール

```bash
code --install-extension cref-0.1.0.vsix
```

または Extensions ビューの `⋯ → Install from VSIX...` から。


## ビルド

```bash
npm install -g @vscode/vsce
vsce package --no-dependencies --allow-missing-repository
```
