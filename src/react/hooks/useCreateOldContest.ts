import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import type {
  ContestYearsResponse,
  CreateOldContestResponse,
} from '../../types/api';

export const useCreateOldContest = () => {
  const { getToken } = useAuth();
  const [year, setYear] = useState<string>('');
  const [judgeNames, setJudgeNames] = useState<string[]>(['']);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [existingYears, setExistingYears] = useState<number[]>([]);
  const [isLoadingYears, setIsLoadingYears] = useState(true);

  // Fetch existing contest years on mount
  useEffect(() => {
    const fetchExistingYears = async () => {
      try {
        setIsLoadingYears(true);
        const token = await getToken();
        const response = await fetch('/api/admin/old-contests', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result: ContestYearsResponse = await response.json();

        if (response.ok && result.success && result.data) {
          setExistingYears(result.data.years);
        }
      } catch (err) {
        console.error('Error fetching existing years:', err);
      } finally {
        setIsLoadingYears(false);
      }
    };

    fetchExistingYears();
  }, [getToken]);

  const handleCreateContest = async () => {
    setError(null);
    setSuccess(false);

    // Client-side validation
    const yearNum = parseInt(year);
    if (!year || isNaN(yearNum)) {
      setError('Inserisci un anno valido');
      return;
    }

    const currentYear = new Date().getFullYear();
    if (yearNum >= currentYear) {
      setError(
        `Non puoi creare un concorso per l'anno corrente (${currentYear}) o anni futuri`
      );
      return;
    }

    if (existingYears.includes(yearNum)) {
      setError(`Il concorso per l'anno ${yearNum} esiste già`);
      return;
    }

    try {
      setIsCreating(true);

      const token = await getToken();
      const response = await fetch('/api/admin/old-contests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          year: yearNum,
          judgeNames: judgeNames.filter(name => name.trim().length > 0),
        }),
      });

      const result: CreateOldContestResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || 'Errore durante la creazione del concorso'
        );
      }

      setSuccess(true);
      setExistingYears([...existingYears, yearNum].sort((a, b) => a - b));
      console.log('Contest created successfully:', result);
    } catch (err) {
      console.error('Error creating contest:', err);
      setError(err instanceof Error ? err.message : 'Errore imprevisto');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setYear('');
    setJudgeNames(['']);
    setError(null);
    setSuccess(false);
  };

  const addJudge = () => {
    setJudgeNames([...judgeNames, '']);
  };

  const removeJudge = (index: number) => {
    setJudgeNames(judgeNames.filter((_, i) => i !== index));
  };

  const updateJudgeName = (index: number, value: string) => {
    const updated = [...judgeNames];
    updated[index] = value;
    setJudgeNames(updated);
  };

  return {
    year,
    setYear,
    judgeNames,
    addJudge,
    removeJudge,
    updateJudgeName,
    isCreating,
    error,
    success,
    existingYears,
    isLoadingYears,
    handleCreateContest,
    resetForm,
  };
};
