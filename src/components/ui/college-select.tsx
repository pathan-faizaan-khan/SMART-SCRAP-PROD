"use client";

import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronDown, Search, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface College {
  CollegeName: string;
}

interface CollegeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  includeOtherOption?: boolean;
}

interface CachedData {
  colleges: College[];
  timestamp: number;
}

export function CollegeSelect({
  value,
  onValueChange,
  placeholder = "Select a college...",
  className,
  required = false,
  includeOtherOption = false,
}: CollegeSelectProps) {
  const [colleges, setColleges] = useState<College[]>([]);
  const [filteredColleges, setFilteredColleges] = useState<College[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cache key and expiry time (10 minutes = 600,000 milliseconds)
  const CACHE_KEY = "colleges_data";
  const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes in milliseconds

  // Function to get cached data
  const getCachedData = (): CachedData | null => {
    try {
      if (typeof window === "undefined") return null;

      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const parsedData: CachedData = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid (within 10 minutes)
      if (now - parsedData.timestamp < CACHE_EXPIRY) {
        return parsedData;
      } else {
        // Cache expired, remove it
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
    } catch (error) {
      console.error("Error reading cached data:", error);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  };

  // Function to set cached data
  const setCachedData = (colleges: College[]) => {
    try {
      if (typeof window === "undefined") return;

      const dataToCache: CachedData = {
        colleges,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(dataToCache));
    } catch (error) {
      console.error("Error caching data:", error);
    }
  };

  // Fetch colleges data on component mount with caching
  useEffect(() => {
    const fetchColleges = async () => {
      // First, try to get data from cache
      const cachedData = getCachedData();

      if (cachedData) {
        console.log("Loading colleges from cache");
        setColleges(cachedData.colleges);
        setFilteredColleges(cachedData.colleges);
        return;
      }

      // If no valid cache, fetch from API
      console.log("Fetching colleges from API");
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/site-data?type=colleges", {
          next: { revalidate: 36000 }, // Revalidate every 60 seconds
        });

        if (!response.ok) {
          throw new Error("Failed to fetch colleges");
        }

        const data = await response.json();

        if (data.success === false) {
          throw new Error(data.error || "Failed to load colleges");
        }

        // Handle different response formats
        const collegesData = Array.isArray(data) ? data : data.data || [];

        // Set state
        setColleges(collegesData);
        setFilteredColleges(collegesData);

        // Cache the data
        setCachedData(collegesData);

        console.log(`Cached ${collegesData.length} colleges for 10 minutes`);
      } catch (err) {
        console.error("Error fetching colleges:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load colleges"
        );
        setColleges([]);
        setFilteredColleges([]);
      } finally {
        setLoading(false);
      }
    };

    fetchColleges();
  }, []);

  // Filter colleges based on search term (no limit, use scroll)
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredColleges(colleges);
    } else {
      const filtered = colleges.filter((college) =>
        college.CollegeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredColleges(filtered);
    }
  }, [searchTerm, colleges]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (college: College) => {
    onValueChange(college.CollegeName);
    setIsOpen(false);
    setSearchTerm("");
  };

  // Handle "Other" option selection - use lowercase "other" as value
  const handleOtherSelect = () => {
    onValueChange("other"); // This matches what the registration page expects
    setIsOpen(false);
    setSearchTerm("");
  };

  const selectedCollege = colleges.find(
    (college) => college.CollegeName === value
  );

  // Check if "other" is selected
  const isOtherSelected = value === "other";

  // Function to clear cache manually (useful for debugging)
  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    console.log("College cache cleared");
  };

  // Get display text for the selected value
  const getDisplayText = () => {
    if (isOtherSelected) {
      return "Other (Enter manually)";
    }
    return selectedCollege ? selectedCollege.CollegeName : placeholder;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        required={required}
        title={getDisplayText()}
      >
        <span
          className={cn(
            "block truncate text-left pr-2",
            !selectedCollege && !isOtherSelected && "text-muted-foreground"
          )}
        >
          {getDisplayText()}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 opacity-50 transition-transform flex-shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[300px] rounded-md border bg-popover p-0 shadow-md animate-in fade-in-0 zoom-in-95">
          {/* Search Input */}
          <div className="flex items-center border-b px-3 py-2">
            <Search className="h-4 w-4 opacity-50 mr-2 flex-shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search colleges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-sm"
            />
          </div>

          {/* Results with Scroll */}
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Loading colleges...
              </div>
            ) : error ? (
              <div className="px-3 py-2 text-sm text-red-500">{error}</div>
            ) : filteredColleges.length === 0 && !includeOtherOption ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {searchTerm
                  ? "No colleges found matching your search."
                  : "No colleges available."}
              </div>
            ) : (
              <>
                {/* Show filtered colleges */}
                {filteredColleges.map((college, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelect(college)}
                    className={cn(
                      "relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                      selectedCollege?.CollegeName === college.CollegeName &&
                        "bg-accent"
                    )}
                    title={college.CollegeName}
                  >
                    <span className="block truncate pr-8 text-left">
                      {college.CollegeName}
                    </span>
                    {selectedCollege?.CollegeName === college.CollegeName && (
                      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center flex-shrink-0">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </button>
                ))}

                {/* Show "No results" message only if there are no colleges and search term exists */}
                {filteredColleges.length === 0 && searchTerm && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No colleges found matching "{searchTerm}".
                  </div>
                )}
              </>
            )}
          </div>

          {/* Show count when searching */}
          {searchTerm && filteredColleges.length > 0 && (
            <div className="border-t px-3 py-1.5 text-xs text-muted-foreground">
              Showing {filteredColleges.length} results
            </div>
          )}

          {/* Add "Other" option if includeOtherOption is true */}
          {includeOtherOption && (
            <div className="border-t">
              <button
                type="button"
                onClick={handleOtherSelect}
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                  isOtherSelected && "bg-accent"
                )}
                title="Other (Enter manually)"
              >
                <Edit3 className="h-4 w-4 mr-2 text-blue-600" />
                <span className="block truncate pr-8 text-left text-blue-600 font-medium">
                  Other (Enter manually)
                </span>
                {isOtherSelected && (
                  <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
