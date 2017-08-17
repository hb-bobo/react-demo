export interface DefaultProps {
    PATH: string; // 本地事先设置好的路径或者标识
}

interface PropTypes extends DefaultProps {
    children: React.ReactChildren;
    model: 'none' | 'includes'; // includes 只要有就会判定为有权限
    PERMISSION_CODE: string; // 传进来的路径或者标识
}

export default PropTypes;
