import { Component } from 'react'
import PropTypes from 'prop-types'
import StyleSheetRegistry from './stylesheet-registry'

const styleSheetRegistryCache = new WeakMap()
const getDefaultDocument = () =>
  typeof document !== 'undefined' ? document : undefined
const defaultDocument = getDefaultDocument()
const defaultStyleSheetRegistry = new StyleSheetRegistry({
  document: defaultDocument
})
const isBrowser = typeof window !== 'undefined'

/**
 * Add to cache
 */
if (isBrowser && defaultDocument)
  styleSheetRegistryCache.set(defaultDocument, defaultStyleSheetRegistry)

export default class JSXStyle extends Component {
  constructor(props, context) {
    super(props)
    const { document = getDefaultDocument() } = context
    if (isBrowser && !styleSheetRegistryCache.has(document)) {
      styleSheetRegistryCache.set(
        document,
        new StyleSheetRegistry({ document })
      )
    }
    this.styleSheetRegistry = isBrowser
      ? styleSheetRegistryCache.get(document)
      : defaultStyleSheetRegistry
  }
  static dynamic(info) {
    return info
      .map(tagInfo => {
        const baseId = tagInfo[0]
        const props = tagInfo[1]
        return styleSheetRegistry.computeId(baseId, props)
        const [baseId, props] = tagInfo
        return defaultStyleSheetRegistry.computeId(baseId, props)
      })
      .join(' ')
  }

  componentWillMount() {
    this.styleSheetRegistry.add(this.props, this.context.document)
  }

  shouldComponentUpdate(nextProps) {
    return this.props.css !== nextProps.css
  }

  // To avoid FOUC, we process new changes
  // on `componentWillUpdate` rather than `componentDidUpdate`.
  componentWillUpdate(nextProps) {
    this.styleSheetRegistry.update(this.props, nextProps)
  }

  componentWillUnmount() {
    this.styleSheetRegistry.remove(this.props)
  }

  render() {
    return null
  }
}

JSXStyle.contextTypes = {
  document: PropTypes.object
}

export function flush() {
  const cssRules = defaultStyleSheetRegistry.cssRules()
  defaultStyleSheetRegistry.flush()
  return cssRules
}
