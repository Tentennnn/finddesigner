import { useState, useEffect, useCallback } from 'react';
// FIX: Removed non-exported member 'PostgrestBuilder'.
import { PostgrestError } from '@supabase/supabase-js';

// The query function will be any function that returns a promise resolving to { data, error }
// FIX: Replaced non-exported 'PostgrestBuilder' with 'any' to represent the Supabase query builder.
type SupabaseQuery<T> = () => any;


interface UseSupabaseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: PostgrestError | null;
  isSchemaError: boolean;
  refetch: () => void;
}

export const useSupabaseQuery = <T,>(query: SupabaseQuery<T[]>): UseSupabaseQueryResult<T[]> => {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isSchemaError, setIsSchemaError] = useState(false);

  const executeQuery = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsSchemaError(false);
    setData(null);

    try {
      const { data: resultData, error: resultError } = await query();
      
      if (resultError) {
        // Check for common schema-related errors
        if (resultError.message.includes("relation") && resultError.message.includes("does not exist")) {
             setIsSchemaError(true);
        }
        if (resultError.message.includes("Could not find the table")) {
             setIsSchemaError(true);
        }
        setError(resultError);
      } else {
        setData(resultData);
      }
    } catch (e: any) {
       // FIX: Added missing 'name' property to conform to the 'PostgrestError' type, which extends 'Error'.
       const pgError: PostgrestError = {
           name: 'PostgrestError',
           message: e.message || 'An unknown error occurred.',
           details: '',
           hint: '',
           code: e.code || ''
       }
       setError(pgError);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    executeQuery();
  }, [executeQuery]);

  return { data, loading, error, isSchemaError, refetch: executeQuery };
};

// A version of the hook for queries that return a single item (.single())
export const useSupabaseSingleQuery = <T,>(query: SupabaseQuery<T>): Omit<UseSupabaseQueryResult<T[]>, 'data'> & { data: T | null } => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<PostgrestError | null>(null);
    const [isSchemaError, setIsSchemaError] = useState(false);
  
    const executeQuery = useCallback(async () => {
      setLoading(true);
      setError(null);
      setIsSchemaError(false);
      setData(null);
  
      try {
        const { data: resultData, error: resultError } = await query().single();
        
        if (resultError) {
          // Gracefully handle 'not found' for .single() queries, which is not a true "error"
          // in many application contexts (e.g., checking if a profile exists).
          if (resultError.code === 'PGRST116') {
            setData(null);
          } else {
            if (resultError.message.includes("relation") && resultError.message.includes("does not exist")) {
                 setIsSchemaError(true);
            }
            if (resultError.message.includes("Could not find the table")) {
                 setIsSchemaError(true);
            }
            setError(resultError);
          }
        } else {
          setData(resultData);
        }
      } catch (e: any) {
         // FIX: Added missing 'name' property to conform to the 'PostgrestError' type, which extends 'Error'.
         const pgError: PostgrestError = {
             name: 'PostgrestError',
             message: e.message || 'An unknown error occurred.',
             details: '',
             hint: '',
             code: e.code || ''
         }
         setError(pgError);
      } finally {
        setLoading(false);
      }
    }, [query]);
  
    useEffect(() => {
      executeQuery();
    }, [executeQuery]);
  
    return { data, loading, error, isSchemaError, refetch: executeQuery };
}
