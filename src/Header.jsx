import {
    AppBar,
    Toolbar,
    Typography,
    makeStyles,
    Button,
} from "@material-ui/core";
import React from "react";
import { Link as RouterLink } from "react-router-dom";

const headersData = [
    {
        label: "Feed",
        href: "/posts",
    },
    {
        label: "Messages",
        href: "/messages",
    },
    {
        label: "Search",
        href: "/search",
    },
    {
        label: "Admin Panel",
        href: "/admin",
    },
    {
        label: "Log Out",
        href: "/logout",
    },
];

const useStyles = makeStyles(() => ({
    menuButton: {
        fontFamily: "Open Sans, sans-serif",
        fontWeight: 700,
        size: "18px",
        marginLeft: "38px",
    },
    toolbar: {
        display: "flex",
        justifyContent: "center",
    },
}));

function Header() {
    const { toolbar, menuButton } = useStyles();

    const displayDesktop = () => {
        return (
            <Toolbar className={toolbar}>
                <div>{getMenuButtons()}</div>
            </Toolbar>
        );
    };

    const getMenuButtons = () => {
        return headersData.map(({ label, href }) => {
            return (
                <Button
                    {...{
                    key: label,
                    color: "inherit",
                    to: href,
                    component: RouterLink,
                    className: menuButton,
                    }}
                >
                {label}
            </Button>
            );
        });
    };

    return (
        <header>
            <AppBar>{displayDesktop()}</AppBar>
        </header>
    );
}

export default Header;