import * as React from 'react';
import PropTypes from 'prop-types';
import './scroller.css';
import { getRemainingHeight } from '@/utils/dom';
import { throttle } from '@/utils/tools';
import AlloyTouch from 'alloytouch';
import Transform from './transform.js';
import IconLoading from '@/components/icon/loading';
import IconArrow from '@/components/icon/arrow';
/**
 * scroll容器
 */
class Scroller extends React.Component {
    static defaultProps = {
        containerHeight: 100,
        autoSetHeight: false,
        bottomHeight: 0, // 底部高。May have a menu at the bottom,
        scrollTop: 0,
        bounce: true, // 是否反弹，关掉是默认的scrollbar, 如果没有下拉上拉加载数据建议设为false
        config: {
            downContent: '', // 下拉时显示的文字
            upContent: '' // 上拉时显示的文字
        },
        donePulldown: 'done'
    }
    static propTypes = {
        containerHeight: PropTypes.number,
        autoSetHeight: PropTypes.bool,
        bottomHeight: PropTypes.number,
        config: PropTypes.object,
        onScrollBottom: PropTypes.func, // 上拉到底了，会多次执行
        onPullupLoading: PropTypes.func, // 上拉到一定层度并放开时
        onPulldownLoading: PropTypes.func, // 下拉到一定层度并放开时
        to: PropTypes.func // scroller 跳到的位置(目前是Y轴)
    }
    state = {
        first: true,
        config: {},
        pulldownStatus: 'default',
        pullupStatus: 'default'
    }
    componentWillReceiveProps (nextProps, nextState) {
        this.setState({
            config: nextProps.config
        });
    }
    componentWillMount () {
        // 初始化containerHeight
        this.setState({
            containerHeight: this.props.containerHeight,
        });
    }
    componentDidMount () {
        if (this.props.autoSetHeight) {
            this.setHeight();
        }
        // 记录scrollTop 位置
        if (this.refs.scrollerContainer && this.props.bounce === false) {
            this.refs.scrollerContainer.addEventListener('scroll', throttle(() => {
                if (this.refs.scrollerContainer !== undefined) {
                    this.setState({
                        scrollTop: this.refs.scroller.scrollTop
                    });
                }
            }, 500));
        }

    }
    componentDidUpdate () {
        if (!this.state.first || !this.props.bounce) {
            return false;
        }
        if (this.state.first) {
            this.setState({
                first: false
            });
        }
        var {
            scroller,
            scrollerContainer
        } = this.refs; // 当前组件

        var { containerHeight } = this.state;
        var min = 0;
        var max = 0;
        var _this = this; //当前组件
        Transform(scroller, true);
        var scrollerAt = new AlloyTouch({
            touch: scrollerContainer,//反馈触摸的dom
            vertical: true,//不必需，默认是true代表监听竖直方向touch
            target: scroller, //运动的对象
            property: "translateY",  //被运动的属性
            min: min, //不必需,运动属性的最小值
            max: max, //不必需,滚动属性的最大值
            // sensitivity: 1,//不必需,触摸区域的灵敏度，默认值为1，可以为负数
            // factor: 1,//不必需,表示触摸位移与被运动属性映射关系，默认值是1
            // step: 45,//用于校正到step的整数倍
            // bindSelf: false,
            initialValue: 0,
            change: function (value) {
            }, 
            touchStart: function (ev, value) {
                // 每次点击都重新计算scroll高度
                min = (containerHeight - scroller.clientHeight) - 10;
                if (min > max) {
                    min = max;
                }
                this.min = min;
            },
            touchMove: function (ev, value) {
                // 缓冲距离
                var bufferVal = 20;
                // 上拉到底了
                if (value < (this.min - bufferVal)) {
                    _this.setState({
                        pullupStatus: value < (this.min - 25) ? 'ready' : 'default'
                    });
                    // _this.onScrollBottom();
                    return;
                }
                // 下拉中
                if (value > bufferVal) {
                    _this.setState({
                        pulldownStatus: value > 40 ? 'ready' : 'default'
                    });
                }
                
            },
            touchEnd: function (ev, value) {
                // 下拉最大值了，并松开了
                if (value > 40) {
                    _this.onPulldownLoading();
                    return false;
                }
                // 上拉到底了，并松开了 (- bottom-loading的高度)
                if (value < (this.min - 26)) {
                    _this.onPullupLoading();
                }
                
            },
            tap: function (ev, value) {
            },
            pressMove: function (ev, value) {
            },
            animationEnd: function (value) {
            } //运动结束
        });
        
        this.setState({
            scrollerAt: scrollerAt,
            pulldownStatus: 'loading-start'
        });
        // 有下拉方法，则初始化时自动刷新一下
        if (this.props.onPulldownLoading) {scrollerAt.to(40)};
    }
    /*scroller到底部剩余的高度*/
    setHeight (alloyTouch) {
        var remainingHeight = getRemainingHeight(this.refs.scroller); // 计算剩余高
        var containerHeight = remainingHeight - this.props.bottomHeight; // 容器实际剩余高
        this.setState({
            containerHeight: containerHeight
        });
    }
    /*到底部了, 会执行多次*/
    onScrollBottom = () => {
        this.props.onScrollBottom && this.props.onScrollBottom();
    }
    /*上拉加载*/
    onPullupLoading = () => {
        var { scrollerAt } = this.state;
        if (scrollerAt) {
            this.setState({
                pullupStatus: 'loading-start'
            });
        }
        this.props.onPullupLoading && this.props.onPullupLoading();
        this.autoDoneAll();
    }
    /*下拉加载*/
    onPulldownLoading = () => {
        var { scrollerAt } = this.state;
        
        if (scrollerAt) {
            // 此时下拉到了一定位置并放开了手，可以加载数据了
            // onPulldownLoading没有的话就表示不开启loading，at就会到0
            // 30为 loding图标的高度
            var val = this.props.onPulldownLoading ? 30 : 0;
            scrollerAt.to(val);
            this.setState({
                pulldownStatus: 'loading-start'
            });
        }
        this.props.onPulldownLoading && this.props.onPulldownLoading();
        this.autoDoneAll();
    }
    /*上拉完成*/
    donePullup = () => {
        var { scrollerAt } = this.state;
        if (scrollerAt) {
            this.setState({
                pullupStatus: 'default'
            });
        }
    }
    /*下拉完成*/
    donePulldown = () => {
        var { scrollerAt } = this.state;
        if (scrollerAt) {
            scrollerAt.to(0);
            this.setState({
                pulldownStatus: 'default'
            });
        }
    }
    /*自动完成 超时时需要*/
    autoDoneAll = () => {
        var { scrollerAt, pullupStatus, pulldownStatus } = this.state;
        if (scrollerAt === undefined) {
            return false;
        }
        window.clearTimeout(scrollerAt.timer);
        scrollerAt.timer = window.setTimeout(() => {
            if (pullupStatus !== 'default') { this.donePullup() }
            if (pulldownStatus !== 'default') { this.donePulldown() }
        }, 10000);
    }
    /**
     * scroller to some where
     * @param {string} y | x
     * @param {number} scrollTop | scrollLeft
     */
    to = (key, value) => {
        var { scrollerAt } = this.state;
        if (!scrollerAt) {
            return;
        }
        if (key === 'y') {
            scrollerAt.to(value);
        }
    }
    render () {
        var children = this.props.children;
        var containerHeight = this.state.containerHeight;
        var { config, pulldownStatus, pullupStatus } = this.state;
        return (
            <div>
                <div ref="scrollerContainer" className="scroller-container" style={{height: parseInt(containerHeight, 10) + 'px'}}>
                    <div ref="scroller" className="scroller">
                        {/*下拉*/
                            (this.state.scrollerAt && this.props.onPulldownLoading) ?
                                <div className="top-loading text-center">
                                    <span>
                                        <IconLoading 
                                            style={{width: 20, height: 20}}
                                            show={pulldownStatus === 'loading-start' ? true: false}
                                        />
                                        <IconArrow
                                            show={pulldownStatus === 'loading-start' ? false: true}
                                            className={pulldownStatus === 'default' ? 'icon icon-arrow' : 'icon icon-arrow rotate'}
                                        />
                                    </span>
                                </div> :
                                null
                        }
                        {
                            children && React.Children.toArray(children).map((child) => child)
                        }
                        { /*上拉*/
                            (this.state.scrollerAt && this.props.onPullupLoading && this.state.scrollerAt.min < -1) ? 
                                <div className="bottom-loading text-center" onClick={this.props.onPullupLoading}>
                                    <span>
                                        {
                                            config.upContent? 
                                                config.upContent :
                                                <IconLoading 
                                                    style={{width: 20, height: 20}}
                                                    show={pullupStatus === 'loading-start' ? true : false}
                                                />
                                        }
                                        <IconArrow
                                            show={(pullupStatus === 'loading-start' && config.upContent === '') ? false: true}
                                            className={pullupStatus === 'default' ? 'icon icon-arrow rotate' : 'icon icon-arrow'}
                                        />
                                    </span>
                                </div> :
                                null

                        }                        
                    </div>
                </div>
            </div>
        )
    }
}

export default Scroller