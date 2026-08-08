# cref

コメントに書いたパスへ即ジャンプする VS Code 拡張。

```ruby
# @spec/models/user_spec.rb
```

このコメントを書いておくだけで、`Ctrl+Shift+T` でそのファイルへ飛べます。コメント中の `@パス` は `Cmd+クリック`(`Ctrl+クリック`)でも直接開けます。


## 使い方

ファイル先頭 10 行以内に `# @<パス>` 形式のコメントを書くだけ。`#`/`//` の直後には半角スペースが 1 つ以上必要です。

```ruby
# @spec/models/user_spec.rb

class User
```

```typescript
// @src/__tests__/utils.test.ts

export function formatDate(date: Date) {
```

```
//@spec/models/user_spec.rb   // NG: スペースなしは認識されない
```

パスはワークスペースルートからの相対パスで指定します。複数の `@パス` コメントが見つかった場合はクイックピックで選択できます。


## コメントがない場合の自動推定

`@パス` コメントがない場合、ファイルの拡張子に応じてテスト⇔実装ファイルを相互に探します(テストファイル側からコマンドを実行した場合も、対応する実装ファイルへジャンプします)。

## キーバインド

| OS | ショートカット |
|----|--------------|
| Linux | `Ctrl+Shift+T` |


## 対応言語

| 拡張子 | ルール |
|---|---|
|.rb|RubyTestRule|
|.js|JsTestRule|
|.ts/.tsx|TsTestRule|

新しい言語に対応させる場合は `src/rules/` に `<名前>-test-rule.ts` という名前のファイルを追加し、`Rule` インターフェース(`exts`, `getCandidates`)を実装したインスタンスを `export default` するだけで自動的に登録されます。

