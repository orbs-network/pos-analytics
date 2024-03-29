import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useClickOutside } from 'react-click-outside-hook';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import SearchRoundedIcon from '@material-ui/icons/SearchRounded';
import { GuardiansResults } from './guardians-results';
import { setGuardianLoading, getGuardianAction } from 'redux/actions/actions';
import { AppState } from 'redux/types/types';
import { routes } from 'routes/routes';
import {
  getGuardianName,
  checkIfLoadDelegator,
  getGuardianByAddress,
} from 'utils/guardians';
import './guardian-search.scss';
import { isMobile } from 'react-device-detect';

interface StateProps {
  address?: string;
  section: string;
}

export const GuardianSearch = ({ address, section }: StateProps) => {
  const { guardians, selectedGuardian } = useSelector(
    (state: AppState) => state.guardians
  );
  const { web3, blockRef } = useSelector(
    (state: AppState) => state.main
  );

  const dispatch = useDispatch();
  const history: any = useHistory();
  const { t } = useTranslation();
  const [ref, hasClickedOutside] = useClickOutside();
  const [inputValue, setInputValue] = useState<string>('');
  const [showResults, setShowResults] = useState<boolean>(false);

  useEffect(() => {
    searchGuardianByAddress(address);
    setGuardianNameAsValue(address || selectedGuardian?.address);
  }, []);

  useEffect(() => {
    setGuardianNameAsValue(address);
  }, [guardians && guardians.length]);

  useEffect(() => {
    if (hasClickedOutside) {
      setShowResults(false);
      setGuardianNameAsValue(address);
      const guardianName = getGuardianName(guardians, address);
      if (!guardianName) return;
    }
  }, [hasClickedOutside]);

  const searchGuardianByAddress = (addressParam?: string) => {
    if (!addressParam) {
      return dispatch(setGuardianLoading(false));
    }
    const loadGuardian = checkIfLoadDelegator(
      addressParam,
      selectedGuardian?.address
    );
    if (!loadGuardian) return null;
    history.push(
      routes.guardians.main
        .replace(':section?', section)
        .replace(':address', addressParam)
    );
    dispatch(getGuardianAction(addressParam, web3, blockRef!!));
  };

  const selectGuardian = (guardianAddress: string) => {
    setGuardianNameAsValue(guardianAddress);
    setShowResults(false);
    searchGuardianByAddress(guardianAddress);
  };

  const setGuardianNameAsValue = (addressParam?: string) => {
    if (!addressParam) return;
    const guardian = getGuardianByAddress(guardians, addressParam);

    if (!guardian) return;
    const string = `${guardian.name} (${guardian.address})`;
    setInputValue(string);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const value = e.clipboardData.getData('Text');
    searchGuardianByAddress(value);
  };

  const handleSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!inputValue) return;
    if (e.key === 'Enter' || e.keyCode === 13) {
      searchGuardianByAddress(inputValue);
    }
  };

  const clear = () => {
    setInputValue('');
    setShowResults(true);
  };

  const generateBtn = () => {
    if (inputValue) {
      return (
        <button
          type="button"
          className="search-input-box-btn flex-center"
          onClick={() => clear()}
        >
          <CloseRoundedIcon />
        </button>
      );
    }
    return (
      <button
        type="button"
        className="search-input-box-btn flex-center"
        onClick={() =>
          inputValue
            ? searchGuardianByAddress(inputValue)
            : setShowResults(true)
        }
      >
        <SearchRoundedIcon />
      </button>
    );
  };

  return (
    <div
      className={`guardian-search search-input ${
        isMobile ? '' : 'flex-column'
      }`}
    >
      <p className="search-input-title">{t('guardians.selectGuardian')}</p>
      <section className="search-input-box" ref={ref}>
        {generateBtn()}
        <input
          onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) =>
            handleSubmit(e)
          }
          type="text"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInputValue(e.target.value)
          }
          value={inputValue}
          onFocus={() => setShowResults(true)}
          onPaste={(e: React.ClipboardEvent<HTMLInputElement>) =>
            handlePaste(e)
          }
          placeholder={t('guardians.inputPlaceholder')}
        />
        {showResults && (
          <GuardiansResults
            guardians={guardians}
            inputValue={inputValue}
            select={selectGuardian}
          />
        )}
      </section>
    </div>
  );
};
