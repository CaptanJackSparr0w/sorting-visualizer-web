/**
 * Sorting Algorithms with Real-Time Line Highlighting & Complexity Intelligence
 */

const ALGORITHM_INFO = {
  quickSort: {
    title: 'Quick Sort',
    category: 'Divide & Conquer',
    bestTime: 'O(n log n)',
    avgTime: 'O(n log n)',
    worstTime: 'O(n²)',
    space: 'O(log n)',
    stable: 'No',
    inPlace: 'Yes',
    description: 'Quick Sort chooses a pivot element, partitions the array such that smaller values precede the pivot and larger values follow it, then recursively sorts each partition.',
    lines: [
      'function quickSort(arr, low, high):',
      '  if low < high:',
      '    pi = partition(arr, low, high)',
      '    quickSort(arr, low, pi - 1)',
      '    quickSort(arr, pi + 1, high)',
      'function partition(arr, low, high):',
      '  pivot = arr[high], i = low - 1',
      '  for j from low to high - 1:',
      '    if arr[j] < pivot:',
      '      swap(arr[++i], arr[j])',
      '  swap(arr[i+1], arr[high])',
      '  return i + 1'
    ]
  },
  mergeSort: {
    title: 'Merge Sort',
    category: 'Divide & Conquer',
    bestTime: 'O(n log n)',
    avgTime: 'O(n log n)',
    worstTime: 'O(n log n)',
    space: 'O(n)',
    stable: 'Yes',
    inPlace: 'No',
    description: 'Merge Sort recursively divides the array in half until individual elements remain, then repeatedly merges adjacent sorted sub-arrays into a single unified ordered sequence.',
    lines: [
      'function mergeSort(arr, l, r):',
      '  if l < r:',
      '    m = floor((l + r) / 2)',
      '    mergeSort(arr, l, m)',
      '    mergeSort(arr, m + 1, r)',
      '    merge(arr, l, m, r)',
      'function merge(arr, l, m, r):',
      '  while i < left.len and j < right.len:',
      '    if left[i] <= right[j]: arr[k++] = left[i++]',
      '    else: arr[k++] = right[j++]',
      '  flushRemainingElements()'
    ]
  },
  bubbleSort: {
    title: 'Bubble Sort',
    category: 'Comparison Sort',
    bestTime: 'O(n)',
    avgTime: 'O(n²)',
    worstTime: 'O(n²)',
    space: 'O(1)',
    stable: 'Yes',
    inPlace: 'Yes',
    description: 'Bubble Sort repeatedly steps through the array, compares adjacent elements, and swaps them if out of order. Passes continue until the largest values bubble up to the end.',
    lines: [
      'function bubbleSort(arr):',
      '  for i from 0 to n-1:',
      '    swapped = false',
      '    for j from 0 to n-i-2:',
      '      if arr[j] > arr[j+1]:',
      '        swap(arr[j], arr[j+1])',
      '        swapped = true',
      '    if not swapped: break'
    ]
  },
  selectionSort: {
    title: 'Selection Sort',
    category: 'Selection Sort',
    bestTime: 'O(n²)',
    avgTime: 'O(n²)',
    worstTime: 'O(n²)',
    space: 'O(1)',
    stable: 'No',
    inPlace: 'Yes',
    description: 'Selection Sort divides the list into a sorted prefix and unsorted suffix, repeatedly locates the minimum element from the unsorted portion, and swaps it into the sorted region.',
    lines: [
      'function selectionSort(arr):',
      '  for i from 0 to n-1:',
      '    min_idx = i',
      '    for j from i+1 to n-1:',
      '      if arr[j] < arr[min_idx]:',
      '        min_idx = j',
      '    if min_idx != i: swap(arr[i], arr[min_idx])'
    ]
  },
  insertionSort: {
    title: 'Insertion Sort',
    category: 'Insertion Sort',
    bestTime: 'O(n)',
    avgTime: 'O(n²)',
    worstTime: 'O(n²)',
    space: 'O(1)',
    stable: 'Yes',
    inPlace: 'Yes',
    description: 'Insertion Sort iterates through the array and consumes one input element each repetition, growing a sorted output list by shifting larger elements one position to the right.',
    lines: [
      'function insertionSort(arr):',
      '  for i from 1 to n-1:',
      '    key = arr[i], j = i - 1',
      '    while j >= 0 and arr[j] > key:',
      '      arr[j+1] = arr[j]',
      '      j = j - 1',
      '    arr[j+1] = key'
    ]
  },
  heapSort: {
    title: 'Heap Sort',
    category: 'Heap / Selection',
    bestTime: 'O(n log n)',
    avgTime: 'O(n log n)',
    worstTime: 'O(n log n)',
    space: 'O(1)',
    stable: 'No',
    inPlace: 'Yes',
    description: 'Heap Sort builds a Binary Max-Heap from the array data, repeatedly extracts the maximum root element and places it at the end of the array, then restores the heap property.',
    lines: [
      'function heapSort(arr):',
      '  buildMaxHeap(arr)',
      '  for i from n-1 down to 1:',
      '    swap(arr[0], arr[i])',
      '    heapify(arr, i, 0)',
      'function heapify(arr, n, i):',
      '  if left < n and arr[left] > arr[max]: max = left',
      '  if right < n and arr[right] > arr[max]: max = right',
      '  if max != i: swap(arr[i], arr[max]), heapify()'
    ]
  },
  shellSort: {
    title: 'Shell Sort',
    category: 'Diminishing Gap',
    bestTime: 'O(n log n)',
    avgTime: 'O(n^(4/3))',
    worstTime: 'O(n²)',
    space: 'O(1)',
    stable: 'No',
    inPlace: 'Yes',
    description: 'Shell Sort optimizes insertion sort by allowing exchanges of distant items according to a sequence of diminishing gap intervals, reducing elements to nearly sorted order.',
    lines: [
      'function shellSort(arr):',
      '  gap = floor(n / 2)',
      '  while gap > 0:',
      '    for i from gap to n-1:',
      '      temp = arr[i], j = i',
      '      while j >= gap and arr[j-gap] > temp:',
      '        arr[j] = arr[j-gap], j -= gap',
      '      arr[j] = temp',
      '    gap = floor(gap / 2)'
    ]
  },
  bogoSort: {
    title: 'Bogo Sort (Random)',
    category: 'Randomized / Permutation',
    bestTime: 'O(n)',
    avgTime: 'O((n+1)!)',
    worstTime: 'Unbounded (∞)',
    space: 'O(1)',
    stable: 'No',
    inPlace: 'Yes',
    description: 'Featured in the original Python project, Bogo Sort continuously applies random Fisher-Yates permutations to the array until it happens to land in sorted order.',
    lines: [
      'function bogoSort(arr):',
      '  while not isSorted(arr):',
      '    shuffle(arr)'
    ]
  }
};

const SortingAlgorithms = {
  // 1. Quick Sort
  async quickSort(arr, controller) {
    const sortedIndices = new Set();

    async function partition(low, high) {
      const pivot = arr[high];
      let i = low - 1;

      await controller.step({
        pivot: high,
        sorted: Array.from(sortedIndices),
        line: 7,
        phase: `Pivot selected: ${pivot} at index ${high}`
      });

      for (let j = low; j < high; j++) {
        controller.checkAbort();
        controller.stats.comparisons++;

        await controller.step({
          comparing: [j, high],
          pivot: high,
          sorted: Array.from(sortedIndices),
          line: 9,
          phase: `Comparing ${arr[j]} with pivot ${pivot}`
        });

        if (arr[j] < pivot) {
          i++;
          if (i !== j) {
            [arr[i], arr[j]] = [arr[j], arr[i]];
            controller.stats.swaps++;
            await controller.step({
              swapping: [i, j],
              pivot: high,
              sorted: Array.from(sortedIndices),
              line: 10,
              phase: `Swapped smaller element ${arr[i]} into left partition`
            });
          }
        }
      }

      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      controller.stats.swaps++;
      sortedIndices.add(i + 1);

      await controller.step({
        swapping: [i + 1, high],
        pivot: i + 1,
        sorted: Array.from(sortedIndices),
        line: 11,
        phase: `Pivot ${arr[i+1]} secured in final position ${i + 1}`
      });

      return i + 1;
    }

    async function qSort(low, high) {
      if (low < high) {
        const pi = await partition(low, high);
        await qSort(low, pi - 1);
        await qSort(pi + 1, high);
      } else if (low === high) {
        sortedIndices.add(low);
      }
    }

    await qSort(0, arr.length - 1);
  },

  // 2. Merge Sort
  async mergeSort(arr, controller) {
    async function merge(start, mid, end) {
      const left = arr.slice(start, mid + 1);
      const right = arr.slice(mid + 1, end + 1);
      let i = 0, j = 0, k = start;

      while (i < left.length && j < right.length) {
        controller.checkAbort();
        controller.stats.comparisons++;

        await controller.step({
          comparing: [start + i, mid + 1 + j],
          line: 9,
          phase: `Comparing left (${left[i]}) with right (${right[j]})`
        });

        if (left[i] <= right[j]) {
          arr[k] = left[i++];
        } else {
          arr[k] = right[j++];
        }
        controller.stats.swaps++;
        await controller.step({
          swapping: [k],
          line: 10,
          phase: `Merged ${arr[k]} into position ${k}`
        });
        k++;
      }

      while (i < left.length) {
        controller.checkAbort();
        arr[k] = left[i++];
        controller.stats.swaps++;
        await controller.step({ swapping: [k], line: 11, phase: `Flushing left element ${arr[k]}` });
        k++;
      }

      while (j < right.length) {
        controller.checkAbort();
        arr[k] = right[j++];
        controller.stats.swaps++;
        await controller.step({ swapping: [k], line: 11, phase: `Flushing right element ${arr[k]}` });
        k++;
      }
    }

    async function divide(start, end) {
      if (start >= end) return;
      const mid = Math.floor((start + end) / 2);
      await divide(start, mid);
      await divide(mid + 1, end);
      await merge(start, mid, end);
    }

    await divide(0, arr.length - 1);
  },

  // 3. Bubble Sort
  async bubbleSort(arr, controller) {
    const n = arr.length;
    const sortedIndices = [];

    for (let i = 0; i < n; i++) {
      let swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        controller.checkAbort();
        controller.stats.comparisons++;

        await controller.step({
          comparing: [j, j + 1],
          sorted: [...sortedIndices],
          line: 5,
          phase: `Comparing arr[${j}] (${arr[j]}) and arr[${j+1}] (${arr[j+1]})`
        });

        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swapped = true;
          controller.stats.swaps++;

          await controller.step({
            swapping: [j, j + 1],
            sorted: [...sortedIndices],
            line: 6,
            phase: `Swapping ${arr[j+1]} & ${arr[j]}`
          });
        }
      }
      sortedIndices.push(n - i - 1);
      if (!swapped) {
        for (let k = 0; k < n - i - 1; k++) sortedIndices.push(k);
        break;
      }
    }
  },

  // 4. Selection Sort
  async selectionSort(arr, controller) {
    const n = arr.length;
    const sortedIndices = [];

    for (let i = 0; i < n; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        controller.checkAbort();
        controller.stats.comparisons++;

        await controller.step({
          comparing: [minIdx, j],
          pivot: minIdx,
          sorted: [...sortedIndices],
          line: 5,
          phase: `Scanning for minimum value (current min: ${arr[minIdx]})`
        });

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          await controller.step({
            pivot: minIdx,
            sorted: [...sortedIndices],
            line: 6,
            phase: `New minimum found: ${arr[minIdx]} at index ${minIdx}`
          });
        }
      }

      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        controller.stats.swaps++;
        await controller.step({
          swapping: [i, minIdx],
          sorted: [...sortedIndices],
          line: 7,
          phase: `Placed minimum ${arr[i]} at sorted index ${i}`
        });
      }
      sortedIndices.push(i);
    }
  },

  // 5. Insertion Sort
  async insertionSort(arr, controller) {
    const n = arr.length;
    const sortedIndices = [0];

    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;

      await controller.step({
        pivot: i,
        sorted: [...sortedIndices],
        line: 3,
        phase: `Inspecting element ${key} at index ${i}`
      });

      while (j >= 0) {
        controller.checkAbort();
        controller.stats.comparisons++;

        await controller.step({
          comparing: [j, j + 1],
          pivot: i,
          line: 4,
          phase: `Comparing arr[${j}] (${arr[j]}) with key (${key})`
        });

        if (arr[j] > key) {
          arr[j + 1] = arr[j];
          controller.stats.swaps++;
          await controller.step({
            swapping: [j, j + 1],
            line: 5,
            phase: `Shifting ${arr[j]} to the right`
          });
          j--;
        } else {
          break;
        }
      }
      arr[j + 1] = key;
      controller.stats.swaps++;
      sortedIndices.push(i);
      await controller.step({
        swapping: [j + 1],
        line: 7,
        phase: `Inserted key ${key} at position ${j + 1}`
      });
    }
  },

  // 6. Heap Sort
  async heapSort(arr, controller) {
    const n = arr.length;
    const sortedIndices = [];

    async function heapify(length, rootIdx) {
      let largest = rootIdx;
      const left = 2 * rootIdx + 1;
      const right = 2 * rootIdx + 2;

      controller.checkAbort();

      if (left < length) {
        controller.stats.comparisons++;
        if (arr[left] > arr[largest]) largest = left;
      }

      if (right < length) {
        controller.stats.comparisons++;
        if (arr[right] > arr[largest]) largest = right;
      }

      if (largest !== rootIdx) {
        [arr[rootIdx], arr[largest]] = [arr[largest], arr[rootIdx]];
        controller.stats.swaps++;
        await controller.step({
          swapping: [rootIdx, largest],
          sorted: [...sortedIndices],
          line: 9,
          phase: `Heapify: swapped parent ${arr[rootIdx]} with child ${arr[largest]}`
        });
        await heapify(length, largest);
      }
    }

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) await heapify(n, i);

    for (let i = n - 1; i > 0; i--) {
      [arr[0], arr[i]] = [arr[i], arr[0]];
      controller.stats.swaps++;
      sortedIndices.push(i);
      await controller.step({
        swapping: [0, i],
        sorted: [...sortedIndices],
        line: 4,
        phase: `Extracted max root ${arr[i]} to index ${i}`
      });
      await heapify(i, 0);
    }
    sortedIndices.push(0);
  },

  // 7. Shell Sort
  async shellSort(arr, controller) {
    const n = arr.length;
    let gap = Math.floor(n / 2);

    while (gap > 0) {
      for (let i = gap; i < n; i++) {
        const temp = arr[i];
        let j = i;

        await controller.step({
          pivot: i,
          line: 5,
          phase: `Shell gap ${gap}: inspecting element ${temp}`
        });

        while (j >= gap) {
          controller.checkAbort();
          controller.stats.comparisons++;

          await controller.step({
            comparing: [j - gap, j],
            line: 6,
            phase: `Comparing gap elements arr[${j - gap}] and arr[${j}]`
          });

          if (arr[j - gap] > temp) {
            arr[j] = arr[j - gap];
            controller.stats.swaps++;
            await controller.step({
              swapping: [j, j - gap],
              line: 7,
              phase: `Shifting by gap ${gap}`
            });
            j -= gap;
          } else {
            break;
          }
        }
        arr[j] = temp;
        controller.stats.swaps++;
      }
      gap = Math.floor(gap / 2);
    }
  },

  // 8. Bogo Sort
  async bogoSort(arr, controller) {
    function isSorted(a) {
      for (let i = 0; i < a.length - 1; i++) if (a[i] > a[i + 1]) return false;
      return true;
    }
    let iterations = 0;
    while (!isSorted(arr) && iterations < 1000) {
      controller.checkAbort();
      iterations++;
      controller.stats.comparisons += arr.length;

      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[j], arr[i]] = [arr[i], arr[j]];
        controller.stats.swaps++;
      }

      await controller.step({
        swapping: [Math.floor(Math.random() * arr.length)],
        line: 3,
        phase: `Bogo shuffle iteration #${iterations}`
      });
    }
  }
};

window.SortingAlgorithms = SortingAlgorithms;
window.ALGORITHM_INFO = ALGORITHM_INFO;
EOF
