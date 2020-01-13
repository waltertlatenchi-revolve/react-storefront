/**
 * @license
 * Copyright © 2017-2018 Moov Corporation.  All rights reserved.
 */
import React, { Component, Fragment } from 'react'
import withStyles from '@material-ui/core/styles/withStyles'
import Button from '@material-ui/core/Button'
import Fab from '@material-ui/core/Fab'
import Input from '@material-ui/core/Input'
import IconButton from '@material-ui/core/IconButton'
import SearchIcon from '@material-ui/icons/Search'
import ClearIcon from '@material-ui/icons/Clear'
import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'
import Highlight from 'react-highlighter'
import CircularProgress from '@material-ui/core/CircularProgress'
import Link from './Link'
import { inject, observer } from 'mobx-react'
import { onPatch } from 'mobx-state-tree'
import Image from './Image'
import Container from './Container'
import classnames from 'classnames'
import Drawer from '@material-ui/core/Drawer'
import { Hbox } from './Box'
import Track from './Track'
import AmpSearchDrawer from './amp/AmpSearchDrawer'
import AmpSearchResults from './amp/AmpSearchResults'
import AmpForm from './amp/AmpForm'
import AmpState from './amp/AmpState'

/**
 * A modal search UI that displays a single text search field and grouped results.  The
 * data for this component is defined in react-storefront/model/SearchModelBase.  In most cases, you can
 * add this component to your PWA simply by adding it to App.js without any props:
 *
 *  <SearchDrawer/>
 *
 * When the user enters text in the search field, SearchModelBase calls /search/suggest, which by default is mapped to
 * src/search/suggest-handler.js in the starter app.
 *
 * See https://github.com/moovweb/react-storefront-boilerplate/tree/master/src/search/suggest-handler.js for
 * the placeholder implementation of the suggestion API.
 *
 * When the user taps the search icon or types the enter key in the search field, the drawer closes and the url
 * is set to /search?q=(the user's search text).
 *
 * See src/routes.js to edit the mappings for /search and /search/suggest.
 */
export const styles = theme => ({
  root: {
    zIndex: 9999
  },
  paper: {
    backgroundColor: 'rgba(255, 255, 255, .7)'
  },
  paperAnchorBottom: {
    top: '0'
  },
  wrap: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch'
  },
  header: {
    backgroundColor: theme.palette.primary.main,
    padding: theme.margins.container,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch'
  },
  closeButton: {
    color: theme.palette.primary.contrastText,
    margin: '-10px -10px 10px 0',
    alignSelf: 'flex-end',
    '& span': {
      textTransform: 'uppercase',
      fontWeight: 'bold'
    }
  },
  closeButtonText: {
    border: `1px solid ${theme.palette.primary.contrastText}`,
    margin: '0 0 10px 0'
  },
  searchField: {
    flexGrow: 1,
    border: 0,
    borderRadius: '35px',
    backgroundColor: theme.palette.background.paper,
    margin: 0,
    height: '48px'
  },
  searchInput: {
    padding: '0 0 0 20px'
  },
  groupCaption: {
    textTransform: 'uppercase',
    margin: '30px 0 10px 0'
  },
  group: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    '& a strong': {
      fontWeight: 'bold',
      color: theme.palette.text.primary
    }
  },
  thumbnailGroup: {
    display: 'flex',
    listStyle: 'none',
    margin: '0 -15px',
    padding: '0 10px',
    overflowX: 'auto',
    '& > li': {
      margin: '5px'
    },
    '& img': {
      height: '120px'
    }
  },
  thumbnail: {
    marginBottom: '10px'
  },
  results: {
    position: 'relative', // TODO: Only set for AMP if this affects PWA
    flex: 1,
    overflowY: 'auto'
  },
  loading: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%'
  },
  searchFab: {
    height: '48px',
    width: '48px',
    marginLeft: '10px',
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.secondary
  },
  hidden: {
    display: 'none'
  }
})

@withStyles(styles, { name: 'RSFSearchDrawer' })
@inject(({ app: { search, amp }, history, theme }) => ({ search, history, theme, amp }))
@observer
export default class SearchDrawer extends Component {
  static propTypes = {
    /**
     * The placeholder text for the input.  Defaults to "Search..."
     */
    placeholder: PropTypes.string,
    /**
     * Set this prop to use a text button instead of an icon for the close button.  If set, CloseButtonIcon
     * will be ignored
     */
    closeButtonText: PropTypes.string,
    /**
     * Overrides the default close icon.  Takes a React component.
     */
    CloseButtonIcon: PropTypes.func,
    /**
     * Set to false to disable background blurring.  Defaults to true.
     */
    blurBackground: PropTypes.bool,
    /**
     * Set to "icon" to display the search button as an icon in the search input.
     * Set to "fab" to display the search button as a separate floating action button to the right of the search input when
     * the user enters text.
     */
    searchButtonVariant: PropTypes.oneOf(['icon', 'fab']),
    /**
     * Set to false to never show the clear button.  The search icon will be shown inside the input even when the user has entered text.
     */
    showClearButton: PropTypes.bool,
    /**
     * Content to display in place of the results when the search is blank.
     */
    initialContent: PropTypes.element,
    /**
     * The URL to which the search is submitted.
     */
    searchURL: PropTypes.string,
    /**
     * A name for the search field, which will be the name of the query string parameter
     * through which the search string is submitted.
     */
    searchFieldName: PropTypes.string,
    /**
     * AMP Thumbnail Image Width. Defaults to 120
     */
    ampThumbnailWidth: PropTypes.number,
    /**
     * AMP Thumbnail Image Height. Defaults to 120
     */
    ampThumbnailHeight: PropTypes.number,
    /**
     * Props to be applied to the underlying Drawer component
     */
    drawerProps: PropTypes.object
  }

  static defaultProps = {
    placeholder: 'Search...',
    CloseButtonIcon: () => <ClearIcon />,
    blurBackground: true,
    searchButtonVariant: 'fab',
    searchURL: '/search',
    searchFieldName: 'q',
    showClearButton: true,
    ampThumbnailWidth: 120,
    ampThumbnailHeight: 120,
    drawerProps: {
      ModalProps: {
        hideBackdrop: true
      }
    }
  }

  constructor({ search }) {
    super()
    this.inputRef = input => (this.input = input)
    onPatch(search, this.onSearchPatch)
  }

  onSearchPatch = ({ path, value }) => {
    const { blurBackground } = this.props

    if (path === '/show') {
      if (value) {
        setTimeout(() => this.input.focus(), 250)
      } else {
        this.input.blur()
      }
      if (blurBackground) {
        document.body.classList.toggle('moov-blur', value)
      }
    }
  }

  renderContent() {
    const {
      classes,
      search,
      placeholder,
      searchButtonVariant,
      showClearButton,
      searchURL,
      searchFieldName,
      amp
    } = this.props

    const HideWhenEmpty = ({ children }) => (
      <div
        className={search.text.trim().length ? null : classes.hidden}
        amp-bind={`class=>rsfSearchDrawer.searchText.length > 0 ? "" : "${classes.hidden}"`}
      >
        {children}
      </div>
    )

    const SearchButton = ({ Component, ...others }) => (
      <Component
        rel="search"
        type="submit"
        disabled={!amp && search.text.trim().length === 0}
        {...others}
      >
        <SearchIcon />
      </Component>
    )

    return (
      <div className={classes.wrap}>
        <AmpState id="rsfSearchDrawer" initialState={{ open: false, searchText: '' }}>
          <Track event="searchSubmitted" trigger="onSubmit" term={search.text}>
            <AmpForm onSubmit={this.onSearchFormSubmit} action={searchURL} mask={false}>
              <div className={classes.header}>
                {this.renderCloseButton()}
                <Hbox>
                  <Input
                    type="text"
                    name={searchFieldName}
                    value={search.text}
                    placeholder={placeholder}
                    onFocus={this.onInputFocus}
                    onChange={e => this.onChangeSearchText(e.target.value)}
                    inputProps={{
                      'amp-bind': 'value=>rsfSearchDrawer.searchText'
                    }}
                    on="input-debounced:AMP.setState({ rsfSearchDrawer: { searchText: rsfSearchDrawer.___moov_submitting ? rsfSearchDrawer.searchText : event.value } })"
                    disableUnderline
                    inputRef={this.inputRef}
                    classes={{
                      root: classes.searchField,
                      input: classes.searchInput
                    }}
                    endAdornment={
                      showClearButton ? (
                        <HideWhenEmpty>
                          <IconButton
                            onClick={this.clearSearch}
                            className={classes.searchReset}
                            rel="clear"
                            on="tap:AMP.setState({ rsfSearchDrawer: { searchText: '' }})"
                          >
                            <ClearIcon rel="clear" />
                          </IconButton>
                        </HideWhenEmpty>
                      ) : (
                        searchButtonVariant === 'icon' && (
                          <SearchButton Component={Button} className={classes.searchButton} />
                        )
                      )
                    }
                  />
                  {searchButtonVariant === 'fab' && (
                    <HideWhenEmpty>
                      <SearchButton Component={Fab} className={classes.searchFab} />
                    </HideWhenEmpty>
                  )}
                </Hbox>
              </div>
            </AmpForm>
          </Track>
        </AmpState>
        {search.loading && (
          <div className={classes.loading}>
            <CircularProgress />
          </div>
        )}
        {this.renderResults()}
      </div>
    )
  }

  render() {
    const { classes, search, blurBackground, amp, drawerProps } = this.props

    if (amp) {
      return <AmpSearchDrawer>{this.renderContent()}</AmpSearchDrawer>
    } else {
      return (
        <Drawer
          open={search.show}
          anchor="bottom"
          className={classes.root}
          classes={{
            paper: blurBackground ? classes.paper : '',
            paperAnchorBottom: classes.paperAnchorBottom
          }}
          {...drawerProps}
        >
          {this.renderContent()}
        </Drawer>
      )
    }
  }

  renderResults() {
    const {
      search: { loading, results },
      classes,
      initialContent,
      amp,
      ampThumbnailHeight,
      ampThumbnailWidth
    } = this.props

    if (amp) {
      return (
        <AmpSearchResults
          classes={classes}
          ampThumbnailHeight={ampThumbnailHeight}
          ampThumbnailWidth={ampThumbnailWidth}
        />
      )
    }

    if (loading) {
      return null
    } else if (results && results.length) {
      return (
        <div className={classes.results}>
          {results.map(group => (
            <Container key={group.caption}>
              <Typography className={classes.groupCaption}>{group.caption}</Typography>
              {this.renderGroup(group)}
            </Container>
          ))}
        </div>
      )
    } else {
      return initialContent
    }
  }

  renderCloseButton() {
    const { classes, closeButtonText, CloseButtonIcon } = this.props
    const ButtonElement = closeButtonText ? Button : IconButton

    return (
      <ButtonElement
        className={classnames({
          [classes.closeButton]: true,
          [classes.closeButtonText]: closeButtonText != null
        })}
        color="primary"
        onClick={this.hide}
        on="tap:AMP.setState({ rsfSearchDrawer: { open: false } })"
      >
        {closeButtonText || <CloseButtonIcon />}
      </ButtonElement>
    )
  }

  renderGroup(group) {
    const { classes } = this.props

    return (
      <ul
        className={classnames({
          [classes.group]: !group.thumbnails,
          [classes.thumbnailGroup]: group.thumbnails
        })}
      >
        {group.results.map((result, i) => (
          <li key={i}>
            <Track event="searchSubmitted" term={this.props.search.text}>
              <Link to={result.url} onClick={this.hide}>
                {group.thumbnails ? this.renderThumbnail(result) : this.renderLinkText(result)}
              </Link>
            </Track>
          </li>
        ))}
      </ul>
    )
  }

  renderLinkText(result) {
    return (
      <Typography>
        <Highlight search={this.props.search.text}>{result.text}</Highlight>
      </Typography>
    )
  }

  renderThumbnail(result) {
    const { classes } = this.props

    return (
      <Fragment>
        <div>
          <Image
            className={classes.thumbnail}
            src={result.thumbnail}
            height={result.thumbnailHeight}
            width={result.thumbnailWidth}
          />
        </div>
        <div>
          <Typography>{result.text}</Typography>
        </div>
      </Fragment>
    )
  }

  /**
   * Updates the model when the user enteres search text
   */
  onChangeSearchText = text => {
    this.props.search.setText(text)
  }

  /**
   * Clears the search text
   */
  clearSearch = () => {
    this.onChangeSearchText('')
    this.input.focus()
  }

  /**
   * Hides the drawer
   */
  hide = () => {
    this.props.search.toggle(false)
  }

  /**
   * Submits the search and hides the drawer
   */
  onSearchSubmit = () => {
    const { searchURL, searchFieldName, search } = this.props
    const separator = searchURL.indexOf('?') === -1 ? '?' : '&'
    const url = `${searchURL}${separator}${searchFieldName}=${encodeURIComponent(search.text)}`
    this.props.history.push(url)
    this.hide()
  }

  /**
   * Listener to enable submitting the search by hitting enter
   */
  onSearchFormSubmit = e => {
    e.preventDefault()
    this.onSearchSubmit()
  }

  /**
   * Selects all of the text when the input is focused
   */
  onInputFocus = () => {
    const { input } = this
    input.setSelectionRange(0, input.value.length)
  }

  componentWillUnmount() {
    if (this.props.blurBackground && this.props.search.show) {
      document.body.classList.remove('moov-blur')
    }
  }
}
