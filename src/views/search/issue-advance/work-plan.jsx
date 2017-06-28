import * as React from 'react';
import PropTypes from 'prop-types';
// import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { upWorkPlanListData, upWorkPlanEditData } from '@/store/actions';
import FlatButton from 'material-ui/FlatButton';
import Drawer from 'material-ui/Drawer';

// import pathToJSON from '@/utils/object/pathToJSON';
import Circle from '@/components/circle';
import SpaceRow from '@/components/space-row';
import Scroller from '@/components/scroller';
import WorkPlanEdit from './work-plan-edit';
/*
    planDesc         "描述"
    planFinishDate   "计划完成时间"
    prblmId          "197452"
    prblmPhaseID     "问题阶段"
    rspnsUser        "责任人"
    workPlanID       "101644"
    workPlanStatus   "状态"
*/
const minDate = new Date();
const maxDate = new Date();
minDate.setFullYear(minDate.getFullYear() - 1);
minDate.setHours(0, 0, 0, 0);
maxDate.setFullYear(maxDate.getFullYear() + 1);
maxDate.setHours(0, 0, 0, 0);

@connect(
    // mapStateToProps
    (state) => ({workPlanEditData: state.issueAdvance.workPlanEditData}),
    // buildActionDispatcher
    (dispatch, ownProps) => ({
        actions: bindActionCreators({
            upWorkPlanEditData,
            upWorkPlanListData
        }, dispatch)
    })
)
class WorkPlan extends React.Component {
    static propTypes = {
        parent: PropTypes.object
    }
    state = {
        workPlanOpen: false,
        workPlanAction: '',
    }

    componentDidMount () {
        this.parent = this.props.parent;
    }
    // 新增工作计划
    workPlanNewData = () => {
        this.setState({
            workPlanOpen: true,
            workPlanAction: 'add'
        });
        // 重置值
        this.props.actions.upWorkPlanEditData({
            value: {}
        });
        this.parent.setState({
            title: '新增工作计划',
            isIndex: false
        });
    }
    // 编辑工作计划
    workPlanDataEdit = (data) => {
        this.setState({
            workPlanOpen: true,
            workPlanAction: 'edit'
        });
        this.props.actions.upWorkPlanEditData({
            value: data
        });
        this.parent.setState({
            title: '编辑工作计划',
            isIndex: false
        });
    }

    delItem = (workPlanID) => {
        if (window.confirm('确定删除?')) {
            this.props.actions.upWorkPlanListData({
                action: 'del',
                workPlanID: workPlanID
            });
        }
    }

    render () {
        var data = this.props.workPlanData;
        var { workPlanEditData } = this.props;
        return (
            <div>
                <SpaceRow height={6} />
                <div className="work-paln-title issue-advance-item-title">
                <span>工作计划</span>
                </div>
                <div className="flex-row issue-advance-item">
                    <div className="flex-col-8">
                        <span>阶段: </span>
                        <select name="" id="" style={{marginLeft: '8px'}}>
                            <option value="">请选择</option>
                            <option value="1">阶段</option>
                        </select>
                    </div>
                    <div className="flex-col-2">
                        <svg onClick={this.workPlanNewData} className="icon icon-new" aria-hidden="true">
                            <use xlinkHref="#icon-new"></use>
                        </svg>
                    </div>
                </div>
                <div className="work-plan-list">
                    <Scroller containerHeight={500}>
                        {
                            data.map((item, i) => {
                                return (
                                    <div className="item" key={i}>
                                        <div className="flex-row plan-describe">
                                            <div className="flex-col-9">
                                                <span className="left">
                                                计划描述:
                                                </span>
                                                <span className="right">
                                                    {item.planDesc}
                                                </span>
                                            </div>
                                            <div className="flex-col-1">
                                                <Circle value={item.workPlanStatus}/>
                                            </div>
                                        </div>
                                        <div className="flex-row plan-info">
                                            <div className="flex-col-1">
                                                <div>
                                                    <span>责 任 人 : </span>
                                                    <span className="right">{item.rspnsUser}</span>
                                                </div>
                                            </div>
                                            <div className="flex-col-1">
                                                <div>
                                                    <span>问题阶段: </span>
                                                    <span>{item.prblmPhaseID}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-row plan-info">
                                            <div className="flex-col-1">
                                                <div>
                                                    <span>计划完成时间: </span>
                                                    <span className="right">{item.planFinishDate}</span>
                                                </div>
                                            </div>
                                            <div className="flex-col-1">
                                                <div>
                                                    <span>实际完成时间: </span>
                                                    <span className="right">{item.xx}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-row btn">
                                            <div className="flex-col-1">
                                                <FlatButton 
                                                    label="编辑" 
                                                    fullWidth={true}
                                                    labelStyle={{paddingLeft:'0'}}
                                                    onClick={() => this.workPlanDataEdit(item)}
                                                >
                                                    <svg className="icon" aria-hidden="true">
                                                        <use xlinkHref="#icon-edit"></use>
                                                    </svg>
                                                </FlatButton>
                                               
                                            </div>
                                            <SpaceRow height={30} width="1px" backgroundColor="#EEEDED"/>
                                            <div className="flex-col-1">
                                                <FlatButton 
                                                    label="删除" 
                                                    fullWidth={true}
                                                    labelStyle={{paddingLeft:'0'}}
                                                    onClick={() => this.delItem(item.workPlanID)}
                                                >
                                                    <svg className="icon" aria-hidden="true">
                                                        <use xlinkHref="#icon-del"></use>
                                                    </svg>
                                                </FlatButton>
                                            </div>
                                        </div>
                                        <SpaceRow height={6} width="100%" backgroundColor="#EEEDED"/>
                                    </div>
                                )
                            })
                        }
                    </Scroller>
                </div>
                {/*工作计划弹出*/}
                <Drawer 
                    width="100%" 
                    containerStyle={{top: '48px'}} 
                    openSecondary={true} 
                    open={this.state.workPlanOpen} 
                >
                    <WorkPlanEdit data={workPlanEditData} parent={this} action={this.state.workPlanAction}/>
                </Drawer>
                
                {/*弹出层
                    this.state.open?
                    <Dialog
                        actions={actions}
                        modal={false}
                        contentStyle={customContentStyle}
                        open={this.state.open}
                        onRequestClose={this.handleClose}
                        autoScrollBodyContent={true}
                        >
                        {this.editView()}
                    </Dialog>: null*/
                }
            </div>
        )
    }
}
// const WorkPlanWrapper = createForm()(WorkPlan);

export default WorkPlan;