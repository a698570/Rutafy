import React from 'react'
import { Route, HashRouter, Switch } from 'react-router-dom'
import Main from './components/Main'
import ScrollToTop from './components/ScrollTop'
import Topbar from "./components/Topbar";
import Search from "./components/Search";
import Login from "./components/Login";

export default props => (
    <HashRouter>
      <ScrollToTop>
        <Topbar />
        <Switch>
          <Route exact path='/' component={ Main } />
          <Route exact path='/search' component={ Search } />
          <Route exact path='/login' component={ Login } />
        </Switch>
      </ScrollToTop>
    </HashRouter>
  )
