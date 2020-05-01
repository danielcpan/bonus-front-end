import React, { useState } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import clsx from 'clsx';
import { useHistory } from 'react-router-dom';
import {
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  IconButton,
  Badge,
  Container,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@material-ui/core';
import {
  Menu as MenuIcon,
  Edit as EditIcon,
  ChevronLeft as ChevronLeftIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon
} from '@material-ui/icons';
import { useStyles } from './AppContainer.styles';

const AppSidebar = ({ isOpen, handleDrawerClose, classes }) => {
  const history = useHistory();
  const listItems = [
    { name: 'Dashboard', icon: <DashboardIcon />, url: '/' },
    { name: 'Requests', icon: <ShoppingCartIcon />, url: '/posts' },
    { name: 'All Projects', icon: <PeopleIcon />, url: '/comments' },
    { name: 'My Projects', icon: <BarChartIcon /> },
    { name: 'Edit Environment', icon: <EditIcon />, url: '/edit-env' }
  ];

  return (
    <Drawer
      variant="permanent"
      classes={{
        paper: clsx(classes.drawerPaper, !isOpen && classes.drawerPaperClose)
      }}
      isOpen={isOpen}
    >
      <div className={classes.toolbarIcon}>
        <IconButton onClick={handleDrawerClose}>
          <ChevronLeftIcon />
        </IconButton>
      </div>

      <List>
        {listItems.map(item => (
          <ListItem onClick={() => history.push(item.url || '/')} key={item.name} button>
            {/* <ListItem key={item.name} button> */}
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

const AppToolbar = ({ isOpen, handleDrawerOpen, classes }) => (
  <AppBar
    position="absolute"
    color="inherit"
    className={clsx(classes.appBar, isOpen && classes.appBarShift)}
  >
    <Toolbar className={classes.toolbar}>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="isOpen drawer"
        onClick={handleDrawerOpen}
        className={clsx(classes.menuButton, isOpen && classes.menuButtonHidden)}
      >
        <MenuIcon />
      </IconButton>
      <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
        Projects
      </Typography>
      <IconButton color="inherit">
        <Badge badgeContent={4} color="secondary">
          <NotificationsIcon />
        </Badge>
      </IconButton>
    </Toolbar>
  </AppBar>
);
const AppContainer = ({ isDrawerOpen = false, title, render, style, ...rest }) => {
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(isDrawerOpen);
  const handleDrawerOpen = () => {
    setIsOpen(true);
  };
  const handleDrawerClose = () => {
    setIsOpen(false);
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppToolbar isOpen={isOpen} handleDrawerOpen={handleDrawerOpen} classes={classes} />
      <AppSidebar isOpen={isOpen} handleDrawerClose={handleDrawerClose} classes={classes} />
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          {render({ ...rest })}
        </Container>
      </main>
    </div>
  );
};

export default AppContainer;
