/**
 * Sorting Algorithms with Async Step Callbacks & Complexity Metadata
 * Faithfully ports and optimizes the algorithms from the original Python repository.
 */

const ALGORITHM_INFO = {
  bubbleSort: {
    title: 'Bubble Sort',
    category: 'Comparison Sort',
    bestTime: 'O(n)',
    avgTime: 'O(n²)',
    worstTime: 'O(n²)',
    space: 'O(1)',
    stable: 'Yes',
    description: 'Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. Passes continue until no swaps are needed.',
    pseudocode: `function bubbleSort(arr):
  n = length(arr)
  for i from 0 to n-1:
    swapped = false
    for j from 0 to n-i-2:
      if arr[j] > arr[j+1]:
        swap(arr[j], arr[j+1])
        swapped = true
    if not swapped: break`
  },
  selectionSort: {
    title: 'Selection Sort',
    category: 'Selection Sort',
    bestTime: 'O(n²)',
    avgTime: 'O(n²)',
    worstTime: 'O(n²)',
    space: 'O(1)',
    stable: 'No',
    description: 'Selection Sort divides the list into a sorted and an unsorted region. It repeatedly selects the smallest element from the unsorted region and moves it to the sorted region.',
    pseudocode: `function selectionSort(arr):
  n = length(arr)
  for i from 0 to n-1:
    min_idx = i
    for j from i+1 to n-1:
      if arr[j] < arr[min_idx]:
        min_idx = j
    swap(arr[i], arr[min_idx])`
  },
  insertionSort: {
    title: 'Insertion Sort',
    category: 'Insertion Sort',
    bestTime: 'O(n)',
    avgTime: 'O(n²)',
    worstTime: 'O(n²)',
    space: 'O(1)',
    stable: 'Yes',
    description: 'Insertion Sort builds the final sorted array one item at a time by repeatedly taking the next element and inserting it into its correct position among already sorted elements.',
    pseudocode: `function insertionSort(arr):
  for i from 1 to length(arr)-1:
    key = arr[i]
    j = i - 1
    while j >= 0 and arr[j] > key:
      arr[j+1] = arr[j]
      j = j - 1
    arr[j+1] = key`
  },
  mergeSort: {
    title: 'Merge Sort',
    category: 'Divide & Conquer',
    bestTime: 'O(n log n)',
    avgTime: 'O(n log n)',
    worstTime: 'O(n log n)',
    space: 'O(n)',
    stable: 'Yes',
    description: 'Merge Sort is a recursive divide-and-conquer algorithm. It divides the unsorted list into n sublists, repeatedly merges sublists to produce new sorted sublists until only 1 remains.',
    pseudocode: `function mergeSort(arr, l, r):
  if l < r:
    m = floor((l + r) / 2)
    mergeSort(arr, l, m)
    mergeSort(arr, m + 1, r)
    merge(arr, l, m, r)`
  },
  quickSort: {
    title: 'Quick Sort',
    category: 'Divide & Conquer',
    bestTime: 'O(n log n)',
    avgTime: 'O(n log n)',
    worstTime: 'O(n²)',
    space: 'O(log n)',
    stable: 'No',
    description: 'Quick Sort picks a pivot element, partitions the array so that elements smaller than the pivot come before it and greater elements come after it, then recursively sorts the subarrays.',
    pseudocode: `function quickSort(arr, low, high):
  if low < high:
    pi = partition(arr, low, high)
    quickSort(arr, low, pi - 1)
    quickSort(arr, pi + 1, high)

function partition(arr, low, high):
  pivot = arr[high], i = low - 1
  for j = low to high - 1:
    if arr[j] < pivot:
      i++, swap(arr[i], arr[j])
  swap(arr[i+1], arr[high])
  return i + 1`
  },
  bogoSort: {
    title: 'Bogo Sort (Random)',
    category: 'Exotic / Randomized',
    bestTime: 'O(n)',
    avgTime: 'O((n+1)!)',
    worstTime: 'Unbounded (∞)',
    space: 'O(1)',
    stable: 'No',
    description: 'Bogo Sort (also featured in the original repo) is an intentionally humorous algorithm that repeatedly generates random permutations of its input until it happens to be sorted.',
    pseudocode: `function bogoSort(arr):
  while not isSorted(arr):
    shuffle(arr)`
  },
  heapSort: {
    title: 'Heap Sort',
    category: 'Selection / Heap',
    bestTime: 'O(n log n)',
    avgTime: 'O(n log n)',
    worstTime: 'O(n log n)',
    space: 'O(1)',
    stable: 'No',
    description: 'Heap Sort converts the array into a Max-Heap data structure, repeatedly extracts the maximum element and moves it to the end of the array, rebuilding the heap each step.',
    pseudocode: `function heapSort(arr):
  buildMaxHeap(arr)
  for i = length(arr)-1 down to 1:
    swap(arr[0], arr[i])
    heapify(arr, i, 0)`
  },
  shellSort: {
    title: 'Shell Sort',
    category: 'Diminishing Gap Sort',
    bestTime: 'O(n log n)',
    avgTime: 'O(n^(4/3))',
    worstTime: 'O(n²)',
    space: 'O(1)',
    stable: 'No',
    description: 'Shell Sort is an optimization of insertion sort that allows exchanges of elements that are far apart by sorting subarrays defined by a sequence of diminishing gaps.',
    pseudocode: `function shellSort(arr):
  gap = floor(length(arr)/2)
  while gap > 0:
    for i = gap to length(arr)-1:
      temp = arr[i], j = i
      while j >= gap and arr[j - gap] > temp:
        arr[j] = arr[j - gap]
        j -= gap
      arr[j] = temp
    gap = floor(gap / 2)`
  }
};

/**
 * Algorithm Implementations with async execution hooks
 */
const SortingAlgorithms = {
  // 1. Bubble Sort
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
          phase: `Comparing indices ${j} & ${j + 1}`
        });

        if (arr[j] > arr[j + 1]) {
          // Swap
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          swapped = true;
          controller.stats.swaps++;

          await controller.step({
            swapping: [j, j + 1],
            sorted: [...sortedIndices],
            phase: `Swapping ${arr[j+1]} and ${arr[j]}`
          });
        }
      }
      sortedIndices.push(n - i - 1);
      if (!swapped) {
        // Remaining are sorted
        for (let k = 0; k < n - i - 1; k++) sortedIndices.push(k);
        break;
      }
    }
  },

  // 2. Selection Sort
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
          phase: `Scanning for min value (current min: ${arr[minIdx]})`
        });

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          await controller.step({
            pivot: minIdx,
            sorted: [...sortedIndices],
            phase: `New minimum found: ${arr[minIdx]} at index ${minIdx}`
          });
        }
      }

      if (minIdx !== i) {
        const temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
        controller.stats.swaps++;
        await controller.step({
          swapping: [i, minIdx],
          sorted: [...sortedIndices],
          phase: `Placing minimum ${arr[i]} into sorted index ${i}`
        });
      }
      sortedIndices.push(i);
    }
  },

  // 3. Insertion Sort
  async insertionSort(arr, controller) {
    const n = arr.length;
    const sortedIndices = [0];

    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;

      await controller.step({
        pivot: i,
        sorted: [...sortedIndices],
        phase: `Inserting element ${key} from index ${i}`
      });

      while (j >= 0) {
        controller.checkAbort();
        controller.stats.comparisons++;

        await controller.step({
          comparing: [j, j + 1],
          pivot: i,
          phase: `Comparing ${arr[j]} with key ${key}`
        });

        if (arr[j] > key) {
          arr[j + 1] = arr[j];
          controller.stats.swaps++;
          await controller.step({
            swapping: [j, j + 1],
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
        phase: `Placed ${key} at position ${j + 1}`
      });
    }
  },

  // 4. Merge Sort
  async mergeSort(arr, controller) {
    const sortedIndices = new Set();

    async function merge(start, mid, end) {
      const left = arr.slice(start, mid + 1);
      const right = arr.slice(mid + 1, end + 1);

      let i = 0, j = 0, k = start;

      while (i < left.length && j < right.length) {
        controller.checkAbort();
        controller.stats.comparisons++;

        await controller.step({
          comparing: [start + i, mid + 1 + j],
          phase: `Comparing left sublist (${left[i]}) with right sublist (${right[j]})`
        });

        if (left[i] <= right[j]) {
          arr[k] = left[i];
          i++;
        } else {
          arr[k] = right[j];
          j++;
        }
        controller.stats.swaps++;
        await controller.step({
          swapping: [k],
          phase: `Merged element ${arr[k]} into position ${k}`
        });
        k++;
      }

      while (i < left.length) {
        controller.checkAbort();
        arr[k] = left[i];
        controller.stats.swaps++;
        await controller.step({
          swapping: [k],
          phase: `Flushing remaining left element ${arr[k]}`
        });
        i++;
        k++;
      }

      while (j < right.length) {
        controller.checkAbort();
        arr[k] = right[j];
        controller.stats.swaps++;
        await controller.step({
          swapping: [k],
          phase: `Flushing remaining right element ${arr[k]}`
        });
        j++;
        k++;
      }

      if (start === 0 && end === arr.length - 1) {
        for (let idx = start; idx <= end; idx++) sortedIndices.add(idx);
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

  // 5. Quick Sort
  async quickSort(arr, controller) {
    const sortedIndices = new Set();

    async function partition(low, high) {
      const pivot = arr[high];
      let i = low - 1;

      await controller.step({
        pivot: high,
        sorted: Array.from(sortedIndices),
        phase: `Selected pivot ${pivot} at index ${high}`
      });

      for (let j = low; j < high; j++) {
        controller.checkAbort();
        controller.stats.comparisons++;

        await controller.step({
          comparing: [j, high],
          pivot: high,
          sorted: Array.from(sortedIndices),
          phase: `Comparing ${arr[j]} with pivot ${pivot}`
        });

        if (arr[j] < pivot) {
          i++;
          if (i !== j) {
            const temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
            controller.stats.swaps++;
            await controller.step({
              swapping: [i, j],
              pivot: high,
              sorted: Array.from(sortedIndices),
              phase: `Swapped smaller element ${arr[i]} with ${arr[j]}`
            });
          }
        }
      }

      // Place pivot in correct position
      const temp = arr[i + 1];
      arr[i + 1] = arr[high];
      arr[high] = temp;
      controller.stats.swaps++;
      sortedIndices.add(i + 1);

      await controller.step({
        swapping: [i + 1, high],
        pivot: i + 1,
        sorted: Array.from(sortedIndices),
        phase: `Placed pivot ${arr[i+1]} into final sorted position ${i + 1}`
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

  // 6. Bogo Sort (Random Sort)
  async bogoSort(arr, controller) {
    function isSorted(array) {
      for (let i = 0; i < array.length - 1; i++) {
        if (array[i] > array[i + 1]) return false;
      }
      return true;
    }

    let iterations = 0;
    const maxIterations = 1000; // safety ceiling

    while (!isSorted(arr) && iterations < maxIterations) {
      controller.checkAbort();
      iterations++;
      controller.stats.comparisons += arr.length;

      // Random shuffle (Fisher-Yates)
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
        controller.stats.swaps++;
      }

      await controller.step({
        swapping: [Math.floor(Math.random() * arr.length)],
        phase: `Bogo shuffle iteration #${iterations}`
      });
    }
  },

  // 7. Heap Sort
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
        if (arr[left] > arr[largest]) {
          largest = left;
        }
      }

      if (right < length) {
        controller.stats.comparisons++;
        if (arr[right] > arr[largest]) {
          largest = right;
        }
      }

      if (largest !== rootIdx) {
        const temp = arr[rootIdx];
        arr[rootIdx] = arr[largest];
        arr[largest] = temp;
        controller.stats.swaps++;

        await controller.step({
          swapping: [rootIdx, largest],
          sorted: [...sortedIndices],
          phase: `Heapifying: swapped parent ${arr[rootIdx]} with child ${arr[largest]}`
        });

        await heapify(length, largest);
      }
    }

    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      await heapify(n, i);
    }

    // Extract elements from heap
    for (let i = n - 1; i > 0; i--) {
      const temp = arr[0];
      arr[0] = arr[i];
      arr[i] = temp;
      controller.stats.swaps++;
      sortedIndices.push(i);

      await controller.step({
        swapping: [0, i],
        sorted: [...sortedIndices],
        phase: `Extracted max ${arr[i]} to sorted position ${i}`
      });

      await heapify(i, 0);
    }
    sortedIndices.push(0);
  },

  // 8. Shell Sort
  async shellSort(arr, controller) {
    const n = arr.length;
    let gap = Math.floor(n / 2);

    while (gap > 0) {
      for (let i = gap; i < n; i++) {
        const temp = arr[i];
        let j = i;

        await controller.step({
          pivot: i,
          phase: `Shell gap ${gap}: inspecting element ${temp}`
        });

        while (j >= gap) {
          controller.checkAbort();
          controller.stats.comparisons++;

          await controller.step({
            comparing: [j - gap, j],
            phase: `Comparing gap elements arr[${j - gap}] and arr[${j}]`
          });

          if (arr[j - gap] > temp) {
            arr[j] = arr[j - gap];
            controller.stats.swaps++;
            await controller.step({
              swapping: [j, j - gap],
              phase: `Shifting ${arr[j]} by gap ${gap}`
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
  }
};

window.SortingAlgorithms = SortingAlgorithms;
window.ALGORITHM_INFO = ALGORITHM_INFO;
