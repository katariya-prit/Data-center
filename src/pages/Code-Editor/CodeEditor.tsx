import { useEffect } from 'react'

import CodeEditorSection
  from '../../section/Code-Editor/CodeEditor'

const CodeEditorPage = () => {
  useEffect(() => {
    document.title = 'Code Editor | Data Center'
  }, [])

  return (
    <CodeEditorSection />
  )
}

export default CodeEditorPage