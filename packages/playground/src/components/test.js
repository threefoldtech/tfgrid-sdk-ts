function diskSearch(DisksPool, disk) {
  let start = 0,
    end = DisksPool.length - 1;
  while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    if (DisksPool[mid] === disk) return mid;
    else if (DisksPool[mid] < disk) start = mid + 1;
    else end = mid - 1;
  }
  ++end;
  return DisksPool[end] ? end : -1;
}
const disks = [50];
const pool = [120, 60, 50];

disks.sort((a, b) => a - b);
pool.sort((a, b) => a - b);
console.log(pool);
console.log(disks);
disks.forEach(disk => {
  const index = diskSearch(pool, disk);
  if (index === -1)
    throw new Error(
      `can't fit required disk with size ${disk / 1024 ** 3} to the disks pool of node , please select another node`,
    );
  pool[index] -= disk;
  pool.sort((a, b) => a - b);
});
console.log("result pool", pool);
