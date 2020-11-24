import * as React from 'react';
import * as _ from 'lodash';

import { SENDPROG } from '../t_store';
import { IGraphicOrganizer, TYPE_COM_HEADERS } from '../../common';

import TableItem, { ITableItemProps } from '../../table-item';

interface ITypeProps {
    tableClass: string,
    prog: SENDPROG;
    inview: boolean;
    renderCnt: number;
    graphics: IGraphicOrganizer[];
    clickZoom: (graphic: IGraphicOrganizer, className: string, head_color: string | null) => void;
}

const Type1 = (props: ITypeProps) => {
    const { tableClass, prog, graphics, renderCnt, inview, clickZoom } = props;

    const TableItemProps: ITableItemProps = {
            className: tableClass,
            viewCorrect: prog === SENDPROG.COMPLETE,
            disableSelect: prog === SENDPROG.COMPLETE,
            inview,
            graphic: graphics[0],
            maxWidth: 1080,        
            headerColor: TYPE_COM_HEADERS[0],
            optionBoxPosition: 'bottom',
            viewBtn: true,
            renderCnt,
            onClickBtn: () => clickZoom(graphics[0], 'purple', TYPE_COM_HEADERS[0]),
            isStudent: false,
            idx: 1,
        };

    const tableItemProps = {
        top: { ...TableItemProps
        },
        middle_first: { ...TableItemProps,
            graphic: graphics[1],
            maxWidth: 530,
            headerColor: TYPE_COM_HEADERS[1],
            onClickBtn: () => clickZoom(graphics[1], 'green', TYPE_COM_HEADERS[1]),
            idx: 2
        },
        middle_second: { ...TableItemProps,
            graphic: graphics[2],
            maxWidth: 530,
            headerColor: TYPE_COM_HEADERS[1],
            onClickBtn: () => clickZoom(graphics[2], 'green', TYPE_COM_HEADERS[1]),
            idx: 3
        },
        bottom: { ...TableItemProps,
            graphic: graphics[3],
            maxWidth: 1080,
            headerColor: TYPE_COM_HEADERS[2],
            onClickBtn: () => clickZoom(graphics[3], 'purple', TYPE_COM_HEADERS[2]),
            idx: 4
        },
    };

    return(
    <>
        <div className="top">
            <TableItem {...tableItemProps.top} />
        </div>
        <span className="link_line" />
        <div className="middle">
            <div>
                <TableItem {...tableItemProps.middle_first} />
            </div>
            <div>
                <TableItem {...tableItemProps.middle_first} />
            </div>
        </div>
        <span className="link_line_down" />
        <div className="bottom">
            <TableItem {...tableItemProps.bottom} />
        </div>
    </>);
};

export default Type1;