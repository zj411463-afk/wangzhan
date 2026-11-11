const locales = ["zh", "en", "ja", "ko", "fr", "de", "es"];
const languageNames = { zh: "中文", en: "English", ja: "日本語", ko: "한국어", fr: "Français", de: "Deutsch", es: "Español" };
const mobileTips = {
  zh: ["在手机上选择文件和保存", "从系统文件选择器中选择 MP3，而不是受保护的音乐应用下载。选区手柄不易拖准时，可用开始和结束时间输入框微调。试听后保存，并到浏览器下载列表或系统“文件”应用查找新文件；是否弹出保存窗口由浏览器设置决定。"],
  en: ["Choose and save a file on a phone", "Choose an MP3 from the system file picker, not a protected music-app download. If dragging the handles is difficult, refine the start and end with the time inputs. Preview, save, then check the browser downloads or your Files app. A save dialog depends on browser settings."],
  ja: ["スマートフォンでファイルを選んで保存する", "保護された音楽アプリのダウンロードではなく、端末のファイル選択画面から MP3 を選びます。ハンドルの操作が難しい場合は開始・終了時刻の入力欄で調整してください。試聴して保存した後は、ブラウザーのダウンロード一覧やファイルアプリを確認します。保存ダイアログの有無はブラウザー設定によります。"],
  ko: ["휴대전화에서 파일 선택과 저장", "보호된 음악 앱 다운로드가 아닌 MP3 파일을 시스템 파일 선택기에서 고르세요. 손잡이 조작이 어렵다면 시작과 종료 시간 입력란으로 미세 조정하세요. 미리 듣고 저장한 뒤 브라우저 다운로드 목록이나 파일 앱을 확인하세요. 저장 창 표시 여부는 브라우저 설정에 따라 다릅니다."],
  fr: ["Choisir et enregistrer sur téléphone", "Choisissez un MP3 dans le sélecteur de fichiers, et non un téléchargement protégé d’une application musicale. Si les poignées sont difficiles à déplacer, ajustez les heures dans les champs de début et de fin. Écoutez puis enregistrez et consultez les téléchargements ou l’application Fichiers. La fenêtre d’enregistrement dépend du navigateur."],
  de: ["Datei auf dem Telefon auswählen und speichern", "Wähle im Dateidialog ein MP3 statt eines geschützten Downloads aus einer Musik-App. Lassen sich die Griffe schwer bewegen, nutze die Eingaben für Start und Ende. Höre die Auswahl an, speichere und prüfe die Browser-Downloads oder die Dateien-App. Ob ein Speicherdialog erscheint, hängt vom Browser ab."],
  es: ["Elegir y guardar un archivo en el móvil", "Elige un MP3 en el selector de archivos, no una descarga protegida de una aplicación de música. Si cuesta mover los controles, ajusta el inicio y el final en los campos de tiempo. Escucha, guarda y consulta las descargas del navegador o la aplicación Archivos. El diálogo de guardado depende del navegador."]
};
const routes = { ringtone: "scenes/ringtone/", podcast: "scenes/podcast/", mp3: "guides/cut-mp3/", speech: "guides/cut-podcast/", splitter: "mp3-splitter/", edit: "guides/how-to-edit-mp3/", reverser: "audio-reverser/" };
const sitePath = (locale, key) => `/${locale === "zh" ? "" : `${locale}/`}${key ? routes[key] : ""}`;
const content = {
  zh: {
    ui: ["音频剪切工具", "使用场景", "剪切教程", "打开剪切工具", "相关内容", "参考资料", "本页目录", "跳到正文", "更新于", "音频剪切场景与教程"],
    image: "Sonic Cutter 中已加载音频的波形、选区手柄和试听控制（英文界面）",
    caption: "在波形上选择范围，再试听选中的片段。",
    pages: {
      ringtone: { title: "在线制作铃声：剪切 MP3 和 WAV 音乐片段", description: "在浏览器本地剪切 MP3 或 WAV 铃声片段，试听后保存。了解 Android 与 iPhone 设置自定义铃声的区别和格式限制。", intro: "从一段自己喜欢的音乐或录音里挑出合适的片段，先试听，再保存到设备。Sonic Cutter 剪切已有 MP3 和 WAV 文件，不会直接替手机设置铃声。", sections: [
        ["先确定要保留哪一段", "选择容易辨认、开头清楚的乐句。可以先试 15 秒或 30 秒，再根据手机和实际用途调整长度。例如从 00:45 到 01:00 截取 15 秒，试听时确认开头没有漏掉第一个音、结尾没有截断人声。这里的时长是编辑示例，不是所有手机的铃声限制。"],
        ["剪切后仍保留原格式", "MP3 输入导出 MP3，WAV 输入导出 WAV；不会自动转换成 iPhone 铃声格式。MP3 切点会对齐音频帧，WAV 按采样块截取，因此保存的边界可能与输入时间略有不同。剪切不会恢复原文件已经损失的声音细节，也不包含淡入淡出或音量调整。"],
        ["保存后再到手机中设置", "Android 的文件选择入口和支持格式因机型而异，可参考 Pixel 的官方声音设置说明。iPhone 可参考 Apple 的 GarageBand 自定义铃声流程。请先确认文件能在设备上播放，再按设备要求导入；本工具没有开放 M4R 转换。"]
      ] },
      podcast: { title: "播客片段剪切：截取采访、课程与语音录音", description: "从 MP3 或 WAV 播客、采访和课程录音中选取连续片段，保留完整句子并试听。音频在浏览器本地处理，导出保持输入格式。", intro: "需要保存一次访谈里的完整回答，或截取课程中的一段解释时，可以先定位语句，再选择连续范围。Sonic Cutter 适合单段截取，不包含转写、降噪或多片段拼接。", sections: [
        ["从完整语句开始，而不是只截关键词", "先记下原录音的起止时间，再在波形里找到对应位置。例如某个回答从 12:10 持续到 12:42，可以先选择这个范围，试听后给开头吸气和结尾停顿留一点空间。不要让片段失去必要的上下文。"],
        ["长录音取决于设备可用内存", "音频不用上传，但浏览器仍需读取文件并解码预览。较长录音在手机上可能加载较慢，后台切换也可能中断操作。处理大型录音时建议使用内存更充足的电脑，保留原文件并在导出后核对结果。"],
        ["区分分享片段和后期制作", "分享到支持 MP3 的平台时，原始 MP3 片段通常更便于传输；WAV 更适合继续交给编辑软件处理。这里的剪切只保留已有编码或采样数据，不更改声道和采样率，不会把 MP3 变成更高质量的 WAV。"]
      ] },
      mp3: { title: "如何剪切 MP3：选取时间、试听并保存片段", description: "按步骤在 Sonic Cutter 中剪切 MP3：选择文件、调整起止时间、试听选区并保存。解释帧边界、下载位置及手机铃声后续设置。", intro: "下面以保留 00:45 到 01:00 的音乐为例，完成一次 MP3 片段剪切。整个过程使用浏览器内的文件数据；保存后会得到一个新文件，原始音乐不会被修改。", steps: [
        ["打开工具并选择 MP3 文件", "进入音频剪切工具，从设备选择一个 MP3 文件。等待波形和总时长出现。受保护的音乐下载文件不等于 MP3，修改扩展名不能让它成为可剪切的音频。"],
        ["设置开始和结束时间", "拖动波形两侧的选区手柄，或在时间输入框里填写开始 00:45、结束 01:00。也可以移动播放进度先找到音乐位置，再微调范围。请按自己的文件长度调整示例。"],
        ["试听选中的片段", "点击选区试听按钮，从开始位置检查到结束位置。听清第一个音和最后一句，再调整边界。普通播放和选区试听用途不同，预览结果用于帮助确认选区。"],
        ["保存后检查新文件", "点击保存片段，按浏览器的下载设置找到新 MP3。下载可能直接进入“下载”文件夹，不一定弹出窗口。再次播放导出的文件，核对内容和边界，再将它用于铃声或其他编辑流程。"]
      ], sections: [["为什么时间可能有轻微偏差", "MP3 保存需要对齐已有音频帧，选定时间与实际切点可能有毫秒级差异。保留编码数据能避免再次有损压缩，但不能恢复最初压缩时丢失的信息。需要更精细的采样编辑时，可使用原始 WAV；不要把改扩展名当作格式转换。"]] },
      speech: { title: "如何截取播客与采访录音：保留完整语句", description: "学习在 MP3 或 WAV 录音中定位语音、调整句子边界、试听并保存连续片段。包含长录音处理和导出检查方法。", intro: "以一段 12:10 到 12:42 的回答为例，下面的流程帮助你保留完整语义。请按实际录音调整时间；Sonic Cutter 一次导出一个连续选区，不会自动识别人声或生成文字。", steps: [
        ["选择已有的 MP3 或 WAV 录音", "打开剪切工具并选择设备上的录音，等待波形出现。文件的播放兼容性取决于浏览器。手机加载长录音时保持页面在前台，等待文件准备完成。"],
        ["找到目标句子的起点", "移动播放进度到目标时间附近，结合波形和听感确定开始位置。把开始时间放在第一个字之前，保留一点自然停顿，避免切掉辅音或吸气。"],
        ["保留句尾并试听整个选区", "设置结束时间，给最后一个字和尾音留出空间。使用选区试听检查回答是否完整、有无残留下一句话。若要保留多段不连续回答，需要分别导出，本工具目前不支持拼接。"],
        ["保存并核对导出的录音", "保存后用系统播放器检查片段是否完整。MP3 仍为 MP3，WAV 仍为 WAV。若需要降噪、响度处理或转写，请把结果交给支持这些功能的编辑工具，并保留原始录音。"]
      ], sections: [["长录音加载失败怎么办", "本地处理省去了上传，但解码和波形生成仍会消耗内存。先关闭占用内存的其他页面，再用桌面浏览器重试。如果文件在系统播放器中也无法播放，请先检查源文件。不要连续重复点击选择或保存。"]] }
    }
  },
  en: {
    ui: ["Audio cutter", "Use cases", "Guides", "Open audio cutter", "Related reading", "References", "On this page", "Skip to content", "Updated", "Audio cutting use cases and guides"],
    image: "Loaded audio waveform, selection handles and preview controls in Sonic Cutter",
    caption: "Select a range on the waveform, then preview the selected clip.",
    pages: {
      ringtone: { title: "Make a ringtone online from an MP3 or WAV clip", description: "Trim an MP3 or WAV ringtone locally in your browser and preview before saving. Understand Android and iPhone setup and the limits of the exported format.", intro: "Pick a recognizable passage from your own music or recording, preview it, and save a new clip. Sonic Cutter trims existing MP3 and WAV files; setting a phone ringtone is a separate step on your device.", sections: [
        ["Choose a passage with a clear beginning", "Try a 15- or 30-second passage, then adjust it for your device and purpose. For example, 00:45 to 01:00 makes a 15-second selection. Listen for the first note and the end of the vocal line before saving. These are editing examples, not ringtone limits for every phone."],
        ["Keep the source format", "An MP3 input produces MP3; WAV produces WAV. The cutter does not convert the clip into an iPhone ringtone format. MP3 cuts align to existing audio frames; WAV cuts align to sample blocks, so saved boundaries may differ slightly. Cutting does not restore lost detail, add fades, or change volume."],
        ["Set the ringtone on your phone", "Android file selection and supported formats vary by device; see Google's Pixel sound settings. For iPhone, follow Apple's GarageBand ringtone workflow. Check that the clip plays on your device before importing it. M4R conversion is not available in this tool."]
      ] },
      podcast: { title: "Trim podcast clips, interviews and lecture recordings", description: "Keep a continuous passage from an MP3 or WAV podcast or interview. Preview complete sentences and export locally without changing the source format.", intro: "Save a complete interview answer or one explanation from a lecture by locating the speech and selecting a continuous range. Sonic Cutter handles single excerpts, without transcription, noise reduction or joining separate clips.", sections: [
        ["Keep the full sentence and its context", "Note the start and end in the original recording. For an answer from 12:10 to 12:42, start with that range and listen again, leaving room for the opening breath and closing pause. A short clip should still preserve the meaning of the original answer."],
        ["Allow memory for longer recordings", "Audio does not upload, but the browser still reads the file and decodes its preview. Long recordings can load slowly on a phone, and switching apps can interrupt work. Use a computer with more available memory for large recordings, retain the source, and check the exported file."],
        ["Choose between sharing and further editing", "An existing MP3 clip is generally easier to transfer to a platform that accepts MP3; WAV is useful for further editing. Trimming preserves existing encoded or sample data without changing channels or sample rate. It does not turn a compressed MP3 into a higher-quality WAV."]
      ] },
      mp3: { title: "How to cut an MP3: select, preview and save a clip", description: "Cut an MP3 in Sonic Cutter: choose a file, set start and end times, preview the selection and save. Learn about frame boundaries and browser downloads.", intro: "This example keeps the music from 00:45 to 01:00. Adjust those times for your own file. The browser works with local audio data and saves a new file, leaving the original recording intact.", steps: [
        ["Choose an MP3 in the cutter", "Open the audio cutter and select an MP3 from your device. Wait for its waveform and duration. Protected music downloads are not ordinary MP3 files; renaming an extension does not make them editable audio."],
        ["Set the start and end", "Drag the selection handles or enter 00:45 as the start and 01:00 as the end. You can move the playback position to find the passage first, then refine the selection. Use times that fit your recording."],
        ["Preview the selected passage", "Use the selection preview button to listen from the chosen start to end. Check the first note and last phrase, then adjust the boundaries. Full playback and selection preview serve different purposes; use the latter to check your clip."],
        ["Save and check the new file", "Save the clip and find the new MP3 using your browser's download settings. A download may go directly to Downloads without a dialog. Play the result to check its content and boundaries before using it as a ringtone or editing source."]
      ], sections: [["Why the saved time can differ slightly", "MP3 output aligns to existing audio frames, so actual cut points can differ by milliseconds from the entered time. Preserving encoded data avoids another lossy encode but cannot recover detail lost earlier. Use an original WAV for sample-based editing; renaming the extension is not conversion."]] },
      speech: { title: "How to cut a podcast or interview without clipping words", description: "Locate speech in an MP3 or WAV, adjust sentence boundaries, preview and save a continuous excerpt. Includes checks for long recordings and exported files.", intro: "Use a 12:10 to 12:42 answer as a starting example, adjusting the times to your recording. Sonic Cutter exports one continuous selection at a time and does not detect speech or generate transcripts.", steps: [
        ["Choose an MP3 or WAV recording", "Open the cutter, select the recording from your device, and wait for the waveform. Playback compatibility depends on the browser. Keep the page in the foreground while a long recording loads on a phone."],
        ["Locate the beginning of the sentence", "Move playback near the target time and use both listening and the waveform to find the start. Place it just before the first word with a short natural pause, avoiding a clipped consonant or breath."],
        ["Keep the ending and preview the selection", "Leave room for the final word and its decay. Preview the whole selection to check that the answer is complete and the next sentence has not slipped in. Export separate passages separately; joining clips is not supported."],
        ["Save and verify the excerpt", "Play the saved file in your device's player. MP3 remains MP3 and WAV remains WAV. For noise reduction, loudness adjustment or transcription, take the result to an editor that supports those tasks and keep the original recording."]
      ], sections: [["If a long recording fails to load", "Local processing avoids an upload, but decoding and building a waveform still use memory. Close other memory-heavy tabs and retry on a desktop browser. If the system player cannot play the file either, check the source first. Avoid repeatedly selecting or saving while loading is in progress."]] }
    }
  },
  ja: {
    ui: ["音声カッター", "利用シーン", "使い方", "音声カッターを開く", "関連記事", "参考資料", "目次", "本文へ移動", "更新日", "音声カットの利用シーンとガイド"],
    image: "Sonic Cutter の音声波形、選択ハンドル、試聴ボタン（英語表示）", caption: "波形で範囲を指定し、選択した部分を試聴します。",
    pages: {
      ringtone: { title: "MP3・WAVから着信音用の音声をオンラインで切り出す", description: "MP3・WAVの着信音用クリップをブラウザ内でカットし、試聴して保存。AndroidとiPhoneでの設定方法と出力形式の制限を説明します。", intro: "手持ちの音楽や録音から印象的な部分を選び、試聴して新しいファイルとして保存します。Sonic Cutter は MP3 と WAV の切り出しに対応し、端末の着信音設定は保存後に行います。", sections: [
        ["始まりが分かりやすい部分を選ぶ", "まず15秒または30秒を試し、端末や用途に合わせて調整します。例えば00:45から01:00までなら15秒です。最初の音や歌声の終わりが途切れていないか試聴してください。この長さは編集例で、すべての端末の制限ではありません。"],
        ["元の形式で保存する", "MP3 は MP3、WAV は WAV として保存され、iPhone用形式には変換しません。MP3 はフレーム、WAV はサンプルブロックに境界を合わせるため、指定時間と少しずれる場合があります。音質の復元、フェード、音量変更には対応していません。"],
        ["端末で着信音を設定する", "Androidのファイル選択や対応形式は機種によって異なります。Pixelの公式サウンド設定を参考にしてください。iPhoneではAppleのGarageBand手順を確認します。先に端末で再生できるか確認してください。本ツールはM4R変換を提供していません。"]
      ] },
      podcast: { title: "ポッドキャスト・インタビュー・講義の音声を切り出す", description: "MP3・WAVの録音から連続した会話を切り出し、文末まで試聴して保存。ローカル処理で元のファイル形式を保ちます。", intro: "インタビューの回答や講義の説明を保存するには、話し始めと終わりを探して連続した範囲を選びます。文字起こし、ノイズ除去、複数クリップの結合には対応していません。", sections: [
        ["文脈と一文全体を残す", "元の録音で開始と終了をメモします。12:10から12:42までの回答なら、まずその範囲を選び、息継ぎや最後の間を聞いて調整します。短くする場合も回答の意味が変わらないようにします。"],
        ["長い録音ではメモリが必要", "アップロードは不要ですが、ファイルの読み取りとプレビューのデコードには端末のメモリを使います。スマートフォンでは時間がかかったり、アプリ切り替えで中断したりする場合があります。大きな録音にはパソコンを使い、元ファイルを保管してください。"],
        ["共有と追加編集を区別する", "MP3対応の共有先には元のMP3クリップが扱いやすく、WAVは追加編集に向いています。切り出しでは既存データを保ち、チャンネルやサンプルレートは変更しません。MP3を高音質なWAVへ復元する機能ではありません。"]
      ] },
      mp3: { title: "MP3をカットする方法：時間指定・試聴・保存", description: "Sonic CutterでMP3を選び、開始・終了時間を調整し、選択範囲を試聴して保存する手順。フレーム境界とダウンロードの確認方法も説明します。", intro: "00:45から01:00までの音楽を残す例で説明します。時間は自分のファイルに合わせて調整してください。ブラウザ内で処理し、新しいファイルを保存するので元の音楽は変更されません。", steps: [
        ["MP3ファイルを選択する", "音声カッターを開き、端末のMP3を選びます。波形と全体の長さが表示されるまで待ちます。保護された音楽ファイルは通常のMP3ではなく、拡張子の変更だけでは編集できません。"],
        ["開始と終了を設定する", "波形のハンドルを動かすか、開始00:45、終了01:00を入力します。再生位置を動かして曲の場所を探してから範囲を調整することもできます。実際の長さに合った時間を指定してください。"],
        ["選択範囲を試聴する", "選択範囲の試聴ボタンで開始から終了まで確認します。最初の音と最後のフレーズを聞いて境界を調整します。全体再生と範囲試聴は用途が異なるため、クリップの確認には範囲試聴を使います。"],
        ["保存して再生を確認する", "クリップを保存し、ブラウザのダウンロード先で新しいMP3を探します。ダイアログなしでダウンロードフォルダに入る場合もあります。端末で再生し、内容と切り口を確認してから使用してください。"]
      ], sections: [["保存時間が少し変わる理由", "MP3は既存のフレーム境界に合わせて保存するため、指定時間と数ミリ秒ずれる場合があります。再圧縮を避けても、最初の圧縮で失われた音は戻りません。サンプル単位の編集には元のWAVを使い、拡張子変更を形式変換の代わりにしないでください。"]] },
      speech: { title: "ポッドキャストや会話を単語の途中で切らずに保存する方法", description: "MP3・WAVの会話を探し、文の境界を調整して試聴・保存する手順。長い録音の読み込みと出力確認も解説します。", intro: "12:10から12:42までの回答を例に、意味が通る範囲を残します。時間は録音に合わせて変更してください。一度に保存できるのは連続した範囲で、音声認識や文字起こしは行いません。", steps: [
        ["録音を選ぶ", "MP3またはWAVを選択し、波形を待ちます。再生できる形式はブラウザによって異なります。スマートフォンで長い録音を読み込むときは、ページを前面に保ってください。"],
        ["文の始まりを探す", "再生位置を目的の時間付近へ動かし、波形と聞こえ方で開始位置を決めます。最初の単語より少し前に置き、子音や息継ぎを切らないよう自然な間を残します。"],
        ["文末を残して試聴する", "最後の単語と余韻を含めて終了時間を決めます。範囲全体を試聴し、回答が完結しているか、次の発言が混ざっていないか確認します。離れた部分は別々に保存してください。結合はできません。"],
        ["保存した録音を確認する", "端末のプレーヤーで保存結果を再生します。MP3はMP3、WAVはWAVのままです。ノイズ除去、音量調整、文字起こしが必要なら対応する編集ツールを使い、元録音は保管してください。"]
      ], sections: [["長い録音を読み込めない場合", "デコードと波形作成にはメモリを使います。ほかの重いタブを閉じて、パソコンのブラウザで再試行してください。端末のプレーヤーでも再生できなければ、元ファイルを確認します。読み込み中の連続操作は避けてください。"]] }
    }
  },
  ko: {
    ui: ["오디오 자르기", "활용 사례", "사용 안내", "오디오 도구 열기", "관련 글", "참고 자료", "목차", "본문으로 이동", "업데이트", "오디오 자르기 활용 사례와 안내"],
    image: "Sonic Cutter의 오디오 파형, 선택 손잡이와 미리듣기 제어 화면(영문)", caption: "파형에서 범위를 선택한 뒤 해당 구간을 미리 들어보세요.",
    pages: {
      ringtone: { title: "MP3·WAV 구간을 잘라 온라인으로 벨소리 만들기", description: "브라우저에서 MP3·WAV 벨소리 구간을 자르고 미리 들은 뒤 저장하세요. Android와 iPhone 설정 차이 및 출력 형식 제한을 안내합니다.", intro: "음악이나 녹음에서 알아듣기 쉬운 구간을 골라 듣고 새 파일로 저장하세요. Sonic Cutter는 기존 MP3와 WAV를 자르며, 휴대전화의 벨소리 설정은 기기에서 따로 진행합니다.", sections: [
        ["시작이 분명한 구간 선택", "먼저 15초 또는 30초 구간을 시험한 뒤 용도에 맞게 조절하세요. 예를 들어 00:45~01:00은 15초입니다. 첫 음과 마지막 가사가 끊기지 않는지 확인하세요. 이 길이는 편집 예시이며 모든 휴대전화의 제한을 뜻하지 않습니다."],
        ["원본 형식 유지", "MP3는 MP3로, WAV는 WAV로 저장됩니다. iPhone 벨소리 형식으로 변환하지 않습니다. MP3는 프레임, WAV는 샘플 블록에 맞춰 잘라 경계가 조금 달라질 수 있습니다. 손실된 음질 복구, 페이드, 음량 조절은 지원하지 않습니다."],
        ["휴대전화에서 벨소리 설정", "Android의 파일 선택 방법과 지원 형식은 기기마다 다르므로 Pixel 공식 소리 설정을 참고하세요. iPhone은 Apple의 GarageBand 절차를 확인하세요. 가져오기 전에 기기에서 재생되는지 확인하세요. 이 도구는 M4R 변환을 제공하지 않습니다."]
      ] },
      podcast: { title: "팟캐스트·인터뷰·강의 녹음 구간 자르기", description: "MP3·WAV 녹음에서 연속된 발언을 잘라 문장 끝까지 확인하고 저장하세요. 브라우저 로컬 처리로 입력 형식을 유지합니다.", intro: "인터뷰의 답변이나 강의 설명을 저장하려면 발언의 시작과 끝을 찾아 연속된 범위를 선택하세요. 음성 전사, 잡음 제거, 여러 구간 합치기는 지원하지 않습니다.", sections: [
        ["문장과 맥락을 함께 보존", "원본에서 시작과 종료 시간을 기록하세요. 답변이 12:10~12:42라면 먼저 해당 범위를 고른 후 첫 호흡과 마지막 여백을 들어보며 조절하세요. 짧은 클립도 원래 답변의 의미를 유지해야 합니다."],
        ["긴 녹음에는 기기 메모리 필요", "업로드는 없지만 브라우저에서 파일을 읽고 미리듣기를 디코딩합니다. 휴대전화에서는 오래 걸리거나 앱 전환으로 중단될 수 있습니다. 큰 파일은 메모리가 여유 있는 컴퓨터에서 처리하고 원본과 결과를 확인하세요."],
        ["공유와 추가 편집 구분", "MP3를 받는 플랫폼에는 기존 MP3 구간이 전송하기 편하고 WAV는 추가 편집에 유용합니다. 자르기는 채널이나 샘플레이트를 바꾸지 않고 기존 데이터를 보존합니다. MP3를 고음질 WAV로 복구하는 기능은 아닙니다."]
      ] },
      mp3: { title: "MP3 자르는 방법: 시간 선택·미리듣기·저장", description: "Sonic Cutter에서 MP3 선택, 시작·종료 시간 조절, 선택 구간 미리듣기와 저장까지 안내합니다. 프레임 경계와 다운로드 확인도 설명합니다.", intro: "00:45~01:00의 음악을 남기는 예시입니다. 실제 파일에 맞게 시간을 바꾸세요. 브라우저 안에서 처리하고 새 파일로 저장하므로 원본 음악은 수정되지 않습니다.", steps: [
        ["MP3 선택", "오디오 도구를 열고 기기의 MP3를 선택하세요. 파형과 전체 길이가 나타날 때까지 기다리세요. 보호된 음악 다운로드 파일은 일반 MP3가 아니며 확장자 변경만으로 편집할 수 없습니다."],
        ["시작과 종료 설정", "선택 손잡이를 끌거나 시작 00:45, 종료 01:00을 입력하세요. 먼저 재생 위치를 움직여 원하는 부분을 찾은 다음 범위를 조절할 수도 있습니다. 실제 녹음 길이 안의 시간을 사용하세요."],
        ["선택 구간 미리듣기", "선택 구간 미리듣기 버튼으로 시작부터 끝까지 확인하세요. 첫 음과 마지막 구절을 듣고 경계를 조절하세요. 전체 재생과 선택 구간 미리듣기는 다르므로 클립 확인에는 미리듣기를 사용하세요."],
        ["저장 후 결과 확인", "클립을 저장하고 브라우저의 다운로드 위치에서 새 MP3를 찾으세요. 창이 뜨지 않고 다운로드 폴더에 바로 저장될 수 있습니다. 파일을 다시 재생해 내용과 경계를 확인한 뒤 사용하세요."]
      ], sections: [["저장 시간이 조금 다른 이유", "MP3는 기존 오디오 프레임 경계에 맞춰 저장하므로 입력 시간과 밀리초 수준의 차이가 날 수 있습니다. 재압축하지 않아도 처음 압축할 때 잃은 정보는 복원되지 않습니다. 샘플 기반 편집에는 원본 WAV를 사용하세요. 확장자 변경은 변환이 아닙니다."]] },
      speech: { title: "팟캐스트와 인터뷰에서 단어를 끊지 않고 구간 저장하기", description: "MP3·WAV 발언 위치를 찾고 문장 경계를 조절해 미리 듣고 저장하는 방법입니다. 긴 녹음과 출력 확인 방법도 안내합니다.", intro: "12:10~12:42의 답변을 예로 들어 완전한 의미를 보존합니다. 실제 녹음에 맞게 시간을 조절하세요. 한 번에 연속된 구간 하나를 내보내며 음성 인식이나 전사는 수행하지 않습니다.", steps: [
        ["MP3 또는 WAV 녹음 선택", "도구에서 기기의 녹음을 선택하고 파형을 기다리세요. 재생 호환성은 브라우저마다 다릅니다. 휴대전화에서 긴 파일을 읽는 동안 페이지를 앞에 유지하세요."],
        ["문장 시작 찾기", "원하는 시간 근처로 재생 위치를 옮겨 파형과 소리로 시작점을 찾으세요. 첫 단어 앞에 짧은 여유를 두고 자음이나 호흡이 잘리지 않게 합니다."],
        ["문장 끝을 남기고 미리듣기", "마지막 단어와 잔향을 포함하도록 끝을 정하세요. 전체 선택을 들어 답변이 완전한지, 다음 문장이 섞이지 않았는지 확인하세요. 떨어진 구간은 각각 저장해야 하며 합치기는 지원하지 않습니다."],
        ["저장된 구간 확인", "기기의 플레이어로 결과를 재생하세요. MP3는 MP3, WAV는 WAV로 유지됩니다. 잡음 제거, 음량 조절, 전사는 해당 기능을 갖춘 편집기를 사용하고 원본을 보관하세요."]
      ], sections: [["긴 녹음이 열리지 않을 때", "디코딩과 파형 생성에는 메모리가 필요합니다. 메모리를 많이 쓰는 탭을 닫고 데스크톱 브라우저에서 다시 시도하세요. 시스템 플레이어에서도 안 들리면 원본을 먼저 확인하세요. 로딩 중 선택이나 저장을 반복하지 마세요."]] }
    }
  },
  fr: {
    ui: ["Découpe audio", "Usages", "Tutoriels", "Ouvrir l’outil audio", "À lire aussi", "Références", "Sur cette page", "Aller au contenu", "Mis à jour", "Usages et tutoriels de découpe audio"],
    image: "Forme d’onde, poignées de sélection et commandes d’écoute de Sonic Cutter, en anglais", caption: "Sélectionnez une plage dans la forme d’onde, puis écoutez cet extrait.",
    pages: {
      ringtone: { title: "Créer une sonnerie en ligne à partir d’un MP3 ou WAV", description: "Découpez et écoutez un extrait MP3 ou WAV localement avant de l’enregistrer. Découvrez les différences de configuration Android et iPhone et les limites de format.", intro: "Choisissez un passage reconnaissable de votre musique ou enregistrement, écoutez-le et enregistrez un nouveau fichier. Sonic Cutter découpe des MP3 et WAV existants ; la configuration de la sonnerie se fait ensuite sur le téléphone.", sections: [
        ["Choisir un début net", "Essayez un passage de 15 ou 30 secondes, puis adaptez-le à votre appareil. De 00:45 à 01:00, la sélection dure 15 secondes. Vérifiez la première note et la fin des paroles. Ces durées sont des exemples de montage, pas des limites communes à tous les téléphones."],
        ["Conserver le format d’origine", "Un MP3 produit un MP3 et un WAV produit un WAV. Aucune conversion vers le format de sonnerie iPhone n’est effectuée. Les limites suivent les trames MP3 ou les blocs d’échantillons WAV et peuvent varier légèrement. La découpe ne restaure pas les détails perdus et n’ajoute ni fondu ni réglage de volume."],
        ["Configurer la sonnerie sur l’appareil", "Les formats et la sélection des fichiers Android dépendent du modèle ; consultez les réglages audio officiels de Pixel. Pour iPhone, suivez la procédure GarageBand d’Apple. Vérifiez la lecture sur l’appareil avant l’importation. La conversion M4R n’est pas disponible ici."]
      ] },
      podcast: { title: "Découper des extraits de podcast, d’entretien ou de cours", description: "Gardez un passage continu d’un podcast ou entretien MP3 ou WAV. Écoutez des phrases complètes et exportez localement dans le format d’origine.", intro: "Pour garder une réponse d’entretien ou une explication de cours, repérez la parole et sélectionnez un passage continu. Sonic Cutter n’effectue ni transcription, ni réduction de bruit, ni assemblage de plusieurs extraits.", sections: [
        ["Garder la phrase et son contexte", "Notez les limites dans l’enregistrement d’origine. Pour une réponse entre 12:10 et 12:42, commencez par cette plage puis écoutez le souffle initial et la pause finale. Même court, l’extrait doit conserver le sens de la réponse."],
        ["Prévoir de la mémoire pour les longs fichiers", "Aucun envoi n’est nécessaire, mais le navigateur lit le fichier et décode l’aperçu. Un long enregistrement peut charger lentement sur téléphone ou être interrompu en changeant d’application. Préférez un ordinateur disposant de mémoire, gardez l’original et vérifiez le résultat."],
        ["Partager ou poursuivre le montage", "Un extrait MP3 existant est pratique pour une plateforme compatible MP3 ; le WAV convient au montage ultérieur. La découpe conserve les données sans modifier les canaux ni la fréquence d’échantillonnage. Elle ne transforme pas un MP3 compressé en WAV de meilleure qualité."]
      ] },
      mp3: { title: "Comment couper un MP3 : sélectionner, écouter et enregistrer", description: "Découpez un MP3 dans Sonic Cutter : fichier, heures de début et de fin, écoute de la sélection et enregistrement. Comprenez les trames et le téléchargement.", intro: "L’exemple conserve la musique de 00:45 à 01:00. Adaptez ces heures à votre fichier. Le navigateur traite les données locales et enregistre un nouveau fichier sans modifier l’original.", steps: [
        ["Choisir le MP3", "Ouvrez l’outil et choisissez un MP3 sur votre appareil. Attendez la forme d’onde et la durée. Un téléchargement musical protégé n’est pas un MP3 ordinaire ; changer son extension ne le rend pas modifiable."],
        ["Régler le début et la fin", "Déplacez les poignées ou saisissez 00:45 au début et 01:00 à la fin. Vous pouvez d’abord déplacer la position de lecture pour trouver le passage. Les heures doivent rester dans la durée du fichier."],
        ["Écouter la sélection", "Utilisez l’écoute de la sélection pour vérifier le passage du début à la fin. Contrôlez la première note et la dernière phrase, puis affinez les limites. La lecture complète et l’écoute de sélection remplissent des rôles différents."],
        ["Enregistrer et vérifier", "Enregistrez l’extrait et retrouvez le nouveau MP3 dans les téléchargements du navigateur. Il peut être enregistré sans fenêtre de dialogue. Relisez le fichier pour vérifier le contenu et les limites avant de l’utiliser."]
      ], sections: [["Pourquoi les limites peuvent varier", "Le MP3 s’aligne sur les trames existantes ; les points de coupe peuvent donc différer de quelques millisecondes. Éviter une nouvelle compression ne restaure pas les détails déjà perdus. Pour un montage par échantillons, utilisez un WAV original. Renommer l’extension n’est pas une conversion."]] },
      speech: { title: "Couper un podcast ou un entretien sans tronquer les mots", description: "Repérez une phrase MP3 ou WAV, ajustez ses limites, écoutez et enregistrez un extrait continu. Conseils de chargement et de vérification du résultat.", intro: "Prenez comme exemple une réponse de 12:10 à 12:42 et adaptez les heures. Sonic Cutter exporte une seule sélection continue à la fois et ne détecte pas la parole ni ne produit de transcription.", steps: [
        ["Choisir l’enregistrement", "Ouvrez un MP3 ou WAV et attendez la forme d’onde. La compatibilité de lecture dépend du navigateur. Sur téléphone, gardez la page au premier plan pendant le chargement d’un long fichier."],
        ["Repérer le début de la phrase", "Placez la lecture près du passage recherché et combinez écoute et forme d’onde. Commencez un peu avant le premier mot avec une courte pause naturelle, sans couper une consonne ou une inspiration."],
        ["Garder la fin et écouter", "Laissez le dernier mot et sa résonance. Écoutez toute la sélection pour vérifier que la réponse est complète sans la phrase suivante. Exportez séparément les passages éloignés : leur assemblage n’est pas pris en charge."],
        ["Vérifier l’extrait enregistré", "Écoutez le résultat dans le lecteur de votre appareil. MP3 reste MP3 et WAV reste WAV. Utilisez un éditeur adapté pour le bruit, le niveau sonore ou la transcription, et conservez l’enregistrement original."]
      ], sections: [["Si un long fichier ne charge pas", "Le décodage et la forme d’onde consomment de la mémoire. Fermez les onglets lourds et réessayez sur ordinateur. Si le lecteur système ne lit pas non plus le fichier, vérifiez la source. Évitez les sélections et enregistrements répétés pendant le chargement."]] }
    }
  },
  de: {
    ui: ["Audio schneiden", "Anwendungen", "Anleitungen", "Audio-Werkzeug öffnen", "Weiterlesen", "Quellen", "Auf dieser Seite", "Zum Inhalt", "Aktualisiert", "Anwendungen und Anleitungen zum Audioschnitt"],
    image: "Audiowellenform, Auswahlgriffe und Vorschau in Sonic Cutter, englische Oberfläche", caption: "Einen Bereich in der Wellenform wählen und den Ausschnitt anhören.",
    pages: {
      ringtone: { title: "Klingelton online aus einem MP3- oder WAV-Ausschnitt erstellen", description: "MP3- oder WAV-Klingeltöne lokal im Browser schneiden, anhören und speichern. Hinweise zu Android, iPhone und den Grenzen des Ausgabeformats.", intro: "Wähle eine erkennbare Stelle aus eigener Musik oder einer Aufnahme, höre sie an und speichere eine neue Datei. Sonic Cutter schneidet vorhandene MP3- und WAV-Dateien; den Klingelton stellst du anschließend am Telefon ein.", sections: [
        ["Eine Stelle mit klarem Anfang wählen", "Probiere zunächst 15 oder 30 Sekunden und passe die Länge an dein Gerät an. Von 00:45 bis 01:00 sind es 15 Sekunden. Prüfe den ersten Ton und das Ende der Gesangszeile. Diese Längen sind Schnittbeispiele und keine allgemeingültigen Telefonlimits."],
        ["Das Ausgangsformat behalten", "MP3 bleibt MP3, WAV bleibt WAV. Es erfolgt keine Umwandlung in ein iPhone-Klingeltonformat. MP3-Schnitte folgen Audioframes, WAV-Schnitte Sample-Blöcken; die Grenzen können leicht abweichen. Verlorene Details, Überblendungen und Lautstärkeänderungen werden nicht ergänzt."],
        ["Am Telefon als Klingelton einrichten", "Dateiauswahl und Formate unter Android unterscheiden sich je nach Gerät; die offiziellen Pixel-Toneinstellungen helfen weiter. Für iPhone gilt Apples GarageBand-Anleitung. Prüfe zuerst, ob das Gerät die Datei abspielt. M4R-Konvertierung wird hier nicht angeboten."]
      ] },
      podcast: { title: "Podcast-Ausschnitte, Interviews und Vorlesungen schneiden", description: "Zusammenhängende Passagen aus MP3- oder WAV-Aufnahmen auswählen, vollständige Sätze anhören und lokal im ursprünglichen Format speichern.", intro: "Für eine Interviewantwort oder Erklärung aus einer Vorlesung suchst du Anfang und Ende der Sprache und wählst einen zusammenhängenden Bereich. Transkription, Rauschminderung und das Verbinden mehrerer Ausschnitte sind nicht enthalten.", sections: [
        ["Satz und Zusammenhang bewahren", "Notiere Anfang und Ende im Original. Für eine Antwort von 12:10 bis 12:42 wählst du zunächst diesen Bereich und prüfst Atemzug und Schlusspause beim Anhören. Auch ein kurzer Ausschnitt sollte die ursprüngliche Aussage erhalten."],
        ["Speicher für lange Aufnahmen einplanen", "Es gibt keinen Upload, doch der Browser liest und dekodiert die Datei zur Vorschau. Auf dem Telefon kann das länger dauern oder beim App-Wechsel abbrechen. Nutze für große Aufnahmen einen Computer mit mehr freiem Speicher, behalte das Original und prüfe den Export."],
        ["Teilen oder weiterbearbeiten", "Ein vorhandener MP3-Ausschnitt ist für MP3-kompatible Plattformen praktisch; WAV eignet sich zur Weiterbearbeitung. Der Schnitt erhält Daten, Kanäle und Abtastrate. Er verwandelt ein komprimiertes MP3 nicht in eine höherwertige WAV-Aufnahme."]
      ] },
      mp3: { title: "MP3 schneiden: Bereich wählen, anhören und speichern", description: "MP3 mit Sonic Cutter schneiden: Datei wählen, Start und Ende setzen, Auswahl anhören und speichern. Hinweise zu Frame-Grenzen und Downloads.", intro: "Das Beispiel behält die Musik von 00:45 bis 01:00. Passe die Zeiten an deine Datei an. Der Browser verarbeitet lokale Audiodaten und speichert eine neue Datei; das Original bleibt erhalten.", steps: [
        ["MP3 auswählen", "Öffne das Werkzeug und wähle ein MP3 auf deinem Gerät. Warte auf Wellenform und Dauer. Geschützte Musikdownloads sind keine gewöhnlichen MP3-Dateien; eine andere Dateiendung macht sie nicht bearbeitbar."],
        ["Start und Ende setzen", "Ziehe die Auswahlgriffe oder trage 00:45 als Start und 01:00 als Ende ein. Mit der Wiedergabeposition kannst du die Stelle vorher suchen. Verwende Zeiten innerhalb der tatsächlichen Dateilänge."],
        ["Auswahl anhören", "Höre mit der Auswahlvorschau vom gewählten Anfang bis zum Ende. Prüfe ersten Ton und letzten Satz und passe die Grenzen an. Vollständige Wiedergabe und Auswahlvorschau haben unterschiedliche Aufgaben."],
        ["Speichern und Ergebnis prüfen", "Speichere den Ausschnitt und suche das neue MP3 am Download-Ort des Browsers. Es kann ohne Dialog direkt im Download-Ordner landen. Spiele es ab und prüfe Inhalt und Grenzen vor der weiteren Verwendung."]
      ], sections: [["Warum die Zeit leicht abweichen kann", "MP3-Ausgabe richtet sich nach vorhandenen Audioframes. Schnittpunkte können deshalb um Millisekunden abweichen. Keine erneute Kompression bedeutet keine Wiederherstellung bereits verlorener Details. Verwende für Sample-Bearbeitung eine originale WAV-Datei; eine umbenannte Endung ersetzt keine Konvertierung."]] },
      speech: { title: "Podcast oder Interview schneiden, ohne Wörter abzutrennen", description: "Sprache in MP3 oder WAV finden, Satzgrenzen anpassen, anhören und einen zusammenhängenden Ausschnitt speichern. Hilfe bei langen Aufnahmen.", intro: "Eine Antwort von 12:10 bis 12:42 dient als Beispiel. Passe die Zeiten an deine Aufnahme an. Sonic Cutter exportiert jeweils eine zusammenhängende Auswahl, ohne Spracherkennung oder Transkription.", steps: [
        ["Aufnahme auswählen", "Wähle eine MP3- oder WAV-Aufnahme und warte auf die Wellenform. Die Wiedergabekompatibilität hängt vom Browser ab. Halte bei langen Aufnahmen auf dem Telefon die Seite im Vordergrund."],
        ["Satzanfang finden", "Verschiebe die Wiedergabe nahe an die gewünschte Zeit und nutze Wellenform und Gehör. Beginne kurz vor dem ersten Wort mit einer natürlichen Pause, damit kein Konsonant oder Atemzug abgeschnitten wird."],
        ["Satzende erhalten und anhören", "Lass Platz für das letzte Wort und seinen Ausklang. Prüfe die gesamte Auswahl auf eine vollständige Antwort ohne den nächsten Satz. Entfernte Passagen müssen separat exportiert werden; Zusammenfügen ist nicht verfügbar."],
        ["Gespeicherten Ausschnitt prüfen", "Spiele das Ergebnis im Geräteplayer ab. MP3 bleibt MP3, WAV bleibt WAV. Nutze für Rauschminderung, Lautstärke oder Transkription ein geeignetes Programm und behalte die ursprüngliche Aufnahme."]
      ], sections: [["Wenn eine lange Aufnahme nicht lädt", "Dekodierung und Wellenform benötigen Arbeitsspeicher. Schließe speicherintensive Tabs und versuche es am Computer erneut. Spielt auch der Systemplayer die Datei nicht ab, prüfe zuerst die Quelle. Vermeide wiederholtes Auswählen oder Speichern während des Ladens."]] }
    }
  },
  es: {
    ui: ["Cortador de audio", "Usos", "Tutoriales", "Abrir herramienta de audio", "Lecturas relacionadas", "Referencias", "En esta página", "Ir al contenido", "Actualizado", "Usos y tutoriales para cortar audio"],
    image: "Onda de audio, controles de selección y escucha de Sonic Cutter, interfaz en inglés", caption: "Selecciona un intervalo en la onda y escucha el fragmento antes de guardarlo.",
    pages: {
      ringtone: { title: "Crear un tono de llamada online con un MP3 o WAV", description: "Recorta y escucha un tono MP3 o WAV localmente antes de guardarlo. Conoce las diferencias entre Android y iPhone y los límites del formato exportado.", intro: "Elige un pasaje reconocible de tu música o grabación, escúchalo y guarda un archivo nuevo. Sonic Cutter recorta archivos MP3 y WAV existentes; configurar el tono se hace después en el teléfono.", sections: [
        ["Elegir un comienzo claro", "Prueba primero 15 o 30 segundos y ajusta la duración a tu dispositivo. De 00:45 a 01:00 son 15 segundos. Comprueba la primera nota y el final de la voz. Son ejemplos de edición, no límites para todos los teléfonos."],
        ["Mantener el formato original", "MP3 produce MP3 y WAV produce WAV. No se convierte al formato de tonos de iPhone. Los límites siguen los cuadros MP3 o bloques de muestras WAV, por lo que pueden variar ligeramente. El recorte no recupera detalles perdidos ni añade fundidos o ajustes de volumen."],
        ["Configurar el tono en el teléfono", "Los formatos y la selección de archivos Android dependen del modelo; consulta los ajustes de sonido oficiales de Pixel. En iPhone, sigue el procedimiento de GarageBand de Apple. Verifica primero que el archivo se reproduce. Aquí no se ofrece conversión M4R."]
      ] },
      podcast: { title: "Recortar fragmentos de pódcast, entrevistas y clases", description: "Selecciona un pasaje continuo de un pódcast MP3 o WAV, escucha frases completas y guarda localmente sin cambiar el formato original.", intro: "Para guardar una respuesta de entrevista o una explicación, localiza el inicio y el final de la voz y selecciona un intervalo continuo. Sonic Cutter no transcribe, elimina ruido ni une varios fragmentos.", sections: [
        ["Conservar la frase y su contexto", "Anota los tiempos en la grabación original. Para una respuesta de 12:10 a 12:42, elige ese intervalo y revisa la respiración inicial y la pausa final. Un clip corto también debe mantener el significado de la respuesta."],
        ["Reservar memoria para grabaciones largas", "No hay subida, pero el navegador lee y decodifica el archivo para escucharlo. En un móvil puede tardar o interrumpirse al cambiar de aplicación. Usa un ordenador con memoria disponible para archivos grandes, conserva el original y revisa el resultado."],
        ["Compartir o continuar editando", "Un MP3 existente es práctico para plataformas compatibles con MP3; WAV sirve para seguir editando. El recorte conserva los datos, canales y frecuencia de muestreo. No transforma un MP3 comprimido en un WAV de mayor calidad."]
      ] },
      mp3: { title: "Cómo cortar un MP3: seleccionar, escuchar y guardar", description: "Corta un MP3 en Sonic Cutter: elige el archivo, ajusta los tiempos, escucha la selección y guarda. Aprende sobre límites de cuadros y descargas.", intro: "Este ejemplo conserva la música de 00:45 a 01:00. Ajusta los tiempos a tu archivo. El navegador procesa los datos locales y guarda un archivo nuevo sin modificar el original.", steps: [
        ["Elegir el MP3", "Abre la herramienta y selecciona un MP3 de tu dispositivo. Espera la onda y la duración. Una descarga musical protegida no es un MP3 normal; cambiar la extensión no la convierte en audio editable."],
        ["Ajustar inicio y final", "Arrastra los controles o introduce 00:45 como inicio y 01:00 como final. También puedes mover la posición de reproducción para encontrar el pasaje antes de afinarlo. Usa tiempos dentro de la duración real."],
        ["Escuchar la selección", "Usa la escucha de selección para comprobar el intervalo entero. Revisa la primera nota y la última frase y ajusta los límites. La reproducción completa y la escucha de selección tienen usos diferentes."],
        ["Guardar y comprobar", "Guarda el clip y busca el nuevo MP3 en las descargas del navegador. Puede guardarse sin mostrar un diálogo. Reproduce el archivo para revisar contenido y límites antes de usarlo como tono o material de edición."]
      ], sections: [["Por qué el tiempo puede variar un poco", "La salida MP3 se alinea con cuadros existentes, así que el corte puede diferir unos milisegundos. Evitar otra compresión no recupera información perdida antes. Para editar por muestras usa un WAV original; cambiar la extensión no es convertir el formato."]] },
      speech: { title: "Cómo cortar un pódcast o entrevista sin truncar palabras", description: "Localiza voz en MP3 o WAV, ajusta los límites de las frases, escucha y guarda un pasaje continuo. Incluye consejos para grabaciones largas.", intro: "Toma una respuesta de 12:10 a 12:42 como ejemplo y adapta los tiempos. Sonic Cutter exporta una selección continua por vez y no detecta voz ni genera transcripciones.", steps: [
        ["Elegir la grabación", "Selecciona un MP3 o WAV y espera la onda. La compatibilidad depende del navegador. En el móvil, mantén la página en primer plano mientras carga un archivo largo."],
        ["Localizar el inicio de la frase", "Mueve la reproducción cerca del tiempo buscado y combina la onda con la escucha. Empieza un poco antes de la primera palabra, dejando una pausa natural para no cortar consonantes o respiración."],
        ["Conservar el final y escuchar", "Deja espacio para la última palabra y su resonancia. Escucha toda la selección y confirma que no falta parte de la respuesta ni sobra la siguiente frase. Exporta por separado los pasajes alejados; no se pueden unir aquí."],
        ["Verificar el fragmento guardado", "Reproduce el resultado en el reproductor del dispositivo. MP3 sigue siendo MP3 y WAV sigue siendo WAV. Para reducir ruido, ajustar volumen o transcribir, usa un editor adecuado y conserva la grabación original."]
      ], sections: [["Si no carga una grabación larga", "La decodificación y la onda necesitan memoria. Cierra otras pestañas pesadas y prueba en un ordenador. Si el reproductor del sistema tampoco abre el archivo, comprueba el original. Evita repetir la selección o el guardado mientras carga."]] }
    }
  }
};
const { data: splitterCopy } = require("./splitter-pages.cjs");
const { data: reverserCopy } = require("./reverser-pages.cjs");
for (const locale of locales) {
  const copy = splitterCopy[locale];
  content[locale].pages.splitter = { title: copy.title, description: copy.description, intro: copy.intro, sections: copy.sections };
  content[locale].pages.edit = { title: copy.editTitle, description: copy.editDescription, intro: copy.editIntro, steps: copy.steps, sections: copy.editSections };
  content[locale].pages.reverser = reverserCopy[locale];
}
const contentFiles = locales.flatMap((locale) => Object.keys(routes).map((key) => `${sitePath(locale, key).slice(1)}index.html`));
module.exports = { locales, languageNames, routes, sitePath, content, contentFiles, mobileTips };
