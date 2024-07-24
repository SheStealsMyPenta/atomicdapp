import React, { useEffect } from 'react'
import Header from '../component/header/header'
import Home from './home/home'
import './main.css'
import img from '../assets/ha.svg'
import { getOrders, synch_makeorder } from '../Utils/AtomicService'

export default function Main() {
    const [screenWidth, setSreenWidth] = React.useState(window.innerWidth);

    useEffect(() => {

        window.addEventListener("resize", widthSize);


        const intervel = setInterval(() => {
            const orderObj = getOrders();
            if (orderObj) {
                // console.log(orderObj);
                if (Object.keys(orderObj).length === 0) {
                    clearInterval(intervel)
                } else {
                    // console.log(Object.keys(orderObj), 'Object.keys(orderObj)');
                    Object.keys(orderObj).forEach(key => {
                        const cachedParam = orderObj[key]
                        console.log('cachePara', cachedParam);
                        synch_makeorder(cachedParam)
                    });
                }

            } else {
                clearInterval(intervel)
            }




        }, 5000);

        return () => {
            window.removeEventListener("resize", widthSize);
        };

    }, [])

    const widthSize = () => {
        setSreenWidth(window.innerWidth);
    };



    return (
        <div className='main'>
            {/* <div className='qiu1'></div>
            <div className='qiu2'></div> */}
            <div className='header'>
                <Header />
            </div>
            <div className='body'>
                <Home />
            </div>
            <div className='footer' style={{ padding: 20 }}>
                <span style={{}}>Build with<img src={img} alt="" style={{ verticalAlign: 'middle', display: 'inline-block' }} />  Atomic Stark </span>
                <span style={{}}>
                    © 2024 made with <img src={img} alt="" style={{ verticalAlign: 'middle', display: 'inline-block' }} /> by <a href='http://www.zkgamestop.com' className='zkgamestop-link'>zkgamestop team</a>.
                </span>
            </div>
        </div>
    )
}
