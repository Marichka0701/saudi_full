import React, { useState } from "react";

import logo from '../../constants/images/miniSidebar/abu-dabi.svg';
import styles from './LoginPage.module.scss'
import {authService} from "../../services/auth.service";

const LoginPage = () => {
    const [data, setData] = useState({ username: "", password: "" });
    const [error, setError] = useState("");

    const handleChange = ({ currentTarget: input }) => {
        setData({ ...data, [input.name]: input.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await authService.login(data);
        }
        catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className={styles.loginPage_wrapper}>
            <div className={styles.loginPage_wrapper_login}>
                <div className={styles.loginPage_wrapper_login_title}>
                    <img src={logo} alt="abu dabi logo"/>

                    <div>
                        <h1 className={styles.title}>Login to your account</h1>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    action="#"
                    className={styles.loginPage_wrapper_login_form}>
                    <div className={styles.loginPage_wrapper_login_form_block}>
                        <label>
                            Username
                            <input
                                type="text"
                                placeholder="Username"
                                name="username"
                                onChange={handleChange}
                                value={data.username}
                                required
                                className={styles.input}
                            />
                        </label>
                    </div>

                    <div className={styles.loginPage_wrapper_login_form_block}>
                        <label>
                            Password
                            <input
                                type="password"
                                placeholder="Password"
                                name="password"
                                onChange={handleChange}
                                value={data.password}
                                required
                                className={styles.input}
                            />
                        </label>
                        {error && <div className={styles.error}>{error}</div>}
                    </div>
                    <button
                        type={"submit"}
                        className={styles.loginPage_wrapper_login_form_button}
                    >Sign in
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;