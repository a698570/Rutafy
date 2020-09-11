import React from 'react'
import {Route, HashRouter, Switch} from 'react-router-dom'
import Main from './components/Main'
import ScrollToTop from './components/ScrollTop'
import Topbar from "./components/Topbar";
import Search from "./components/Search";
import Login from "./components/Login";
import Favourites from "./components/Favourites";
import Profile from "./components/Profile";
import Statistics from "./components/Statistics";
import Add from "./components/Add";

export default props => (
    <HashRouter>
        <ScrollToTop>
            <Topbar/>
            <Switch>
                <Route exact path='/' component={Main}/>
                <Route exact path='/search' component={Search}/>
                <Route exact path='/login' component={Login}/>
                <Route exact path='/favourites' component={Favourites}/>
                <Route exact path='/profile' component={Profile}/>
                <Route exact path='/stats' component={Statistics}/>
                <Route exact path='/add' component={Add}/>
            </Switch>
        </ScrollToTop>
    </HashRouter>
)
