import React, { useState, useEffect } from 'react';
import styles from '../styles/Toast.module.css';
import cx from 'classnames';

const Toast = (props) => {
  const { toastList } = props;
  const [list, setList] = useState(toastList);
  const dismissTime = 3000;

  const deleteToast = (id) => {
    const index = list.findIndex((e) => e.id === id);
    list.splice(index, 1);
    setList([...list]);
  };

  useEffect(() => {
    setList(toastList);
  }, [toastList, list]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (toastList.length && list.length) {
        deleteToast(toastList[0].id);
      }
    }, dismissTime);

    return () => {
      clearInterval(interval);
    };

    // eslint-disable-next-line
  }, [toastList, dismissTime, list]);

  return (
    <>
      <div className={cx(styles.notificationContainer, styles.bottomCenter)}>
        {list.map((toast, i) => {
          return (
            <div
              key={i}
              className={cx(
                styles.notification,
                styles.toast,
                styles.bottomCenter
              )}
              style={{ backgroundColor: toast.backgroundColor }}
              onClick={() => {
                deleteToast(toast.id);
              }}
            >
              <div className={styles.notificationImage}>
                <img
                  src={
                    toast.icon == 'checkIcon' ? './check.svg' : './error.svg'
                  }
                  alt=""
                />
              </div>
              <div>
                <p className={styles.notificationTitle}>{toast.title}</p>
                <p className={styles.notificationMessage}>
                  {toast.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Toast;
