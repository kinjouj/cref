# cref

コメントに書いたパスへ即ジャンプする VS Code 拡張。

```ruby
# @spec/models/user_spec.rb
```

このコメントを書いておくだけで、`Ctrl+Shift+T` でそのファイルへ飛べます。


## 使い方

ファイル先頭 10 行以内に `# @<パス>` 形式のコメントを書くだけ。

```ruby
# @spec/models/user_spec.rb

class User
```

```typescript
// @src/__tests__/utils.test.ts

export function formatDate(date: Date) {
```

パスはワークスペースルートからの相対パスで指定します。複数の `@パス` コメントが見つかった場合はクイックピックで選択できます。


## コメントがない場合の自動推定

`@パス` コメントがない場合、ファイルの拡張子に応じてテストファイルを探します。

## キーバインド

| OS | ショートカット |
|----|--------------|
| Linux | `Ctrl+Shift+T` |


## 対応言語

| 拡張子 | ルール |
|---|---|
|.rb|RubyTestRule|
|.js|JSTestRule|
|.ts/.tsx|JSTestRule|
