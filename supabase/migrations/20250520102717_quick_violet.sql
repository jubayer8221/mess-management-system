/*
  # Add rent costs tracking

  1. New Tables
    - `rent_costs`
      - `id` (uuid, primary key)
      - `month` (date)
      - `amount` (numeric)
      - `created_at` (timestamp)
      - `created_by` (uuid, references profiles)
      - `updated_at` (timestamp)
      - `updated_by` (uuid, references profiles)

  2. Security
    - Enable RLS on rent_costs table
    - Add policies for admin and manager roles
*/

CREATE TABLE rent_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month date NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id) NOT NULL,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES profiles(id) NOT NULL
);

ALTER TABLE rent_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rent costs are viewable by everyone"
  ON rent_costs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins and managers can insert rent costs"
  ON rent_costs FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Only admins and managers can update rent costs"
  ON rent_costs FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'manager')
    )
  );