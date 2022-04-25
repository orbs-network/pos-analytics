import { GuardianAction } from '@orbs-network/pos-analytics-lib';
import React from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { ETHERSCAN_BLOCK_ADDRESS, POLYGONSCAN_BLOCK_ADDRESS } from 'keys/keys';
import { convertToString } from 'utils/number';
import {
  generateGuardiansActionColors,
  generateGuardiansActionIcon,
  generateGuardiansCurrentStake,
} from 'utils/guardians';
import { GuardianActionsTypes } from 'global/enums';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { isMobile } from 'react-device-detect';
interface StateProps {
  action: GuardianAction;
}

export const GuardianActionComponent = ({ action }: StateProps) => {
  const {
    amount,
    block_time,
    block_number,
    event,
    additional_info_link,
    current_stake,
  } = action;
  const { t } = useTranslation();
  const color = generateGuardiansActionColors(event as GuardianActionsTypes);
  const tokenImg = generateGuardiansActionIcon(event as GuardianActionsTypes);
  const currentStake = generateGuardiansCurrentStake(
    event as GuardianActionsTypes,
    current_stake
  );
  const eventName = t(`guardians.${event}`);
  const explorer_url = window.location.href.includes('/polygon/') ? POLYGONSCAN_BLOCK_ADDRESS : ETHERSCAN_BLOCK_ADDRESS; // TODO: better way

  return (
    <TableRow>
      <TableCell align="left">
        {additional_info_link ? (
          <a
            href={additional_info_link}
            target="_blank"
            rel="noopener noreferrer"
            className="list-item"
          >
            <p>{eventName}</p>
          </a>
        ) : (
          <p className="list-item capitalize">{eventName}</p>
        )}
      </TableCell>
      <TableCell align="left">
        <p>{convertToString(amount, '-')}</p>
      </TableCell>
      <TableCell align="left">
        <div className="flex-start-center">
          <p>{currentStake}</p>
          {tokenImg ? <img src={tokenImg} /> : null}
        </div>
      </TableCell>
      <TableCell align="left">
        <a
          href={`${explorer_url}/${block_number}`}
          target="_blank"
          rel="noopener noreferrer"
          className="list-item"
        >
          <p>{block_number}</p>
        </a>
      </TableCell>
      <>
        {' '}
        {!isMobile && (
          <TableCell align="left">
            <p className="list-item">
              {moment.unix(block_time).format('YYYY-MM-DD')}
            </p>
          </TableCell>
        )}{' '}
      </>
    </TableRow>
  );
};
